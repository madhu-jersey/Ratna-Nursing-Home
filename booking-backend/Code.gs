/**
 * Ratna Nursing Home: appointment bookings over WhatsApp.
 *
 * Lives inside a Google Sheet (Extensions > Apps Script) and is deployed as a web app.
 *  1. The patient taps "Book on WhatsApp" on the website. WhatsApp opens with their request typed out for
 *     reception, and at the same moment the website saves it here as a row in "Appointments".
 *  2. Reception keeps the "Pending bookings" page (this web app's URL + ?view=reception) on the home screen of
 *     their phone. When a WhatsApp booking arrives, they open it, enter the PIN once per phone, tap the
 *     request, check the doctor, date and time, and approve (or decline). Patients never see this page or link.
 *  3. Approving puts the appointment on that doctor's Google Calendar and offers a ready-written WhatsApp
 *     confirmation to the patient. No email is sent at any point.
 *  4. The Schedule tab (?view=schedule) shows every doctor's appointments for a day in one place, read straight
 *     from their calendars, so changes made in Google Calendar show here too.
 *
 * The reception PIN is kept in Project Settings > Script properties as RECEPTION_PIN, never in this file.
 * Setup steps are in booking-backend/SETUP.md.
 */

// Shown when the web app URL is opened in a browser, so you can see which code is live
const VERSION = 'Version 8: all doctors\' schedule, faster';

const CONFIG = {
  HOSPITAL_NAME: 'Ratna Nursing Home',
  HOSPITAL_PHONE: '08819 222250',
  HOSPITAL_ADDRESS: 'Peketi Vari Street, Near Railway Over Bridge, Sajjapuram, Tanuku 534211',
  // Bookable OPD sessions (Monday to Saturday), split into 30-minute appointments. Keep in step with BOOKING in build/data.mjs.
  SESSIONS: [['Morning', '10:00', '14:00'], ['Evening', '17:00', '20:00']],
  SLOT_MINUTES: 30,
  SHEET_NAME: 'Appointments',
  // Optional. Only needed when this script is NOT opened from the sheet (Extensions > Apps Script):
  // paste the sheet's ID, the long code in its address between /d/ and /edit. Left empty, a script made
  // from inside the sheet uses that sheet, and a standalone script makes its own 'Appointments' sheet.
  SHEET_ID: '',
  TIMEZONE: 'Asia/Kolkata',
  // The doctors patients can choose. Keep in step with DOCTORS in build/data.mjs.
  DOCTORS: ['Dr. Valluri Soma Sekhar', 'Dr. Valluri Subba Lakshmi', 'Dr. Valluri Amrutha Ratna', 'Dr. Bikkina Ghana Syam'],
  // Optional: a Google Calendar ID for a doctor, to use a calendar that already exists.
  // Left out, the script makes "<doctor> - Ratna appointments" in this account the first time it is needed;
  // share each one with its doctor (see SETUP.md).
  DOCTOR_CALENDARS: {}
};

// One colour per doctor, in the order of CONFIG.DOCTORS: [Google Calendar colour, the same colour on the Schedule screen]
const DOCTOR_COLORS = [['BLUE', '#2952A3'], ['PLUM', '#7A367A'], ['TEAL', '#0D7377'], ['ORANGE', '#B1440E'], ['GREEN', '#28754E'], ['RED', '#A32929']];
const colorOf_ = doctor => DOCTOR_COLORS[Math.max(0, CONFIG.DOCTORS.indexOf(doctor)) % DOCTOR_COLORS.length];

const DEPARTMENTS = {
  'general-medicine': 'General Medicine',
  'obstetrics-gynaecology': 'Obstetrics & Gynaecology',
  'ultrasound': 'Ultrasound Scanning',
  'infertility': 'Infertility Treatment',
  'laparoscopic-surgery': 'Laparoscopic Surgery',
  'not-sure': 'Not sure yet'
};

// Columns only ever grow at the end, so rows saved by earlier versions keep their places
const HEADERS = ['Request ID', 'Received', 'Status', 'Name', 'Phone', 'Email', 'Department', 'Preferred date', 'Preferred time', 'Message',
  'Confirmed date', 'Confirmed time', 'Decided at', 'Source', 'Token', 'Doctor', 'Calendar event'];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));

/* ---------------- Website -> new request ---------------- */

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.company) return json_({ ok: true }); // honeypot: bots fill the hidden field, people never see it

  const req = {
    // The website makes the ID and secret token, so the approval link can go into the WhatsApp message straight away
    id: /^RNH-\d{6}-[A-Z0-9]{4}$/.test(p.id || '') ? p.id : newId_(),
    token: /^[0-9a-f-]{36}$/.test(p.token || '') ? p.token : Utilities.getUuid(),
    name: clean_(p.name, 80),
    phone: clean_(p.phone, 20),
    department: DEPARTMENTS[p.service] || 'Not given',
    doctor: CONFIG.DOCTORS.indexOf(p.doctor) > -1 ? p.doctor : '',
    date: /^\d{4}-\d{2}-\d{2}$/.test(p.date || '') ? p.date : '',
    time: slots_().indexOf(p.time) > -1 ? p.time : '',
    message: clean_(p.message, 1000),
    source: clean_(p.source, 30) || 'website'
  };
  const errors = [];
  if (req.name.length < 2) errors.push('name');
  if (!/^[+\d][\d\s-]{8,15}$/.test(req.phone)) errors.push('phone');
  if (!req.date || isSunday_(req.date)) errors.push('date');
  if (!req.time) errors.push('time');
  if (errors.length) return json_({ ok: false, errors, version: VERSION });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    // The same request sent twice (a double tap, a retry) is saved once
    if (!findRequest_(req.id, req.token)) {
      sheet_().appendRow([req.id, new Date(), 'Pending', safe_(req.name), "'" + req.phone, '', req.department,
        "'" + prettyDate_(req.date), "'" + timeLabel_(req.time), safe_(req.message), '', '', '', req.source, req.token, req.doctor || 'No preference', '']);
    }
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, id: req.id, version: VERSION });
}

/* ---------------- Reception screens (opened from the Bookings icon on the reception phone) ---------------- */

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.view === 'reception') return pinGate_(p) || pendingPage_(p.pin);
  if (p.view === 'schedule') return pinGate_(p) || schedulePage_(p.pin, p.day);
  if (!p.id) return page_({ title: 'Booking service', body: `<section class="card"><p>The ${CONFIG.HOSPITAL_NAME} booking service is running.</p><p class="muted">${VERSION}</p></section>` });

  // Every booking screen is reception's: the PIN comes first
  const gate = pinGate_(p);
  if (gate) return gate;

  const found = findRequest_(p.id, p.t);
  if (!found) return page_({ title: 'Booking', back: p.pin, body: result_('cross', 'Booking not found', 'It is not in the Appointments sheet.') + listButton_(p.pin) });
  const { row, r } = found;

  if (r.status !== 'Pending') {
    return page_({ title: 'Booking', back: p.pin, body: result_(r.status === 'Approved' ? 'tick' : 'cross', `Already ${r.status.toLowerCase()}`,
      `${esc_(r.name)}'s booking was ${esc_(r.status.toLowerCase())}${r.decidedAt ? ' on ' + esc_(r.decidedAt) : ''}.`) + listButton_(p.pin) });
  }

  if (p.do === 'approve' || p.do === 'decline') {
    const sh = sheet_();
    const decided = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'd MMM yyyy, h:mm a');
    if (p.do === 'approve') {
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(p.cdate || '') ? p.cdate : isoDate_(r.preferred);
      const date = iso ? prettyDate_(iso) : r.preferred;
      const time = clean_(p.ctime, 40);
      const doctor = CONFIG.DOCTORS.indexOf(p.doctor) > -1 ? p.doctor : '';
      let eventNote = 'No doctor chosen, so it is not on a calendar.';
      if (doctor) {
        try {
          const ev = addToCalendar_(r, doctor, iso, time);
          CacheService.getScriptCache().remove('schedule ' + iso); // the Schedule tab shows it straight away
          sh.getRange(row, COL['Calendar event']).setValue(ev ? 'Added to ' + doctor + "'s calendar" : 'Not added: date or time missing');
          eventNote = ev ? `Added to ${esc_(doctor)}'s calendar.` : 'Not added to the calendar: the date or time was missing.';
        } catch (err) {
          sh.getRange(row, COL['Calendar event']).setValue('Calendar error: ' + err.message);
          eventNote = 'Could not add it to the calendar: ' + esc_(err.message);
        }
      }
      sh.getRange(row, COL['Status']).setValue('Approved');
      sh.getRange(row, COL['Confirmed date']).setValue("'" + date);
      sh.getRange(row, COL['Confirmed time']).setValue(safe_(time));
      sh.getRange(row, COL['Decided at']).setValue(decided);
      sh.getRange(row, COL['Doctor']).setValue(doctor || 'Not assigned');
      const msg = `Hello ${r.name}, your appointment at ${CONFIG.HOSPITAL_NAME} is confirmed for ${date}${time ? ', ' + time : ''}${doctor ? ' with ' + doctor : ''}.\nAddress: ${CONFIG.HOSPITAL_ADDRESS}.\nPlease bring any earlier reports and prescriptions. To change or cancel, reply here or call ${CONFIG.HOSPITAL_PHONE}.`;
      return page_({ title: 'Approved', back: p.pin, body:
        result_('tick', 'Approved', `<strong>${esc_(r.name)}</strong><br>${esc_(dayLabel_(date))}${time ? ', ' + esc_(time) : ''}${doctor ? '<br>' + esc_(doctor) : ''}`) +
        `<p class="note">${eventNote}</p>` +
        `<a class="btn wa" href="${waUrl_(r.phone, msg)}" target="_blank" rel="noopener">${ICON.wa}Send confirmation on WhatsApp</a>` +
        listButton_(p.pin) });
    }
    sh.getRange(row, COL['Status']).setValue('Declined');
    sh.getRange(row, COL['Decided at']).setValue(decided);
    const reason = clean_(p.reason, 300);
    const msg = `Hello ${r.name}, we are not able to confirm your appointment request as sent.${reason ? ' ' + reason : ''} Please reply here or call ${CONFIG.HOSPITAL_PHONE} and we will find a time that works.`;
    return page_({ title: 'Declined', back: p.pin, body:
      result_('cross', 'Declined', `<strong>${esc_(r.name)}</strong>'s booking is declined.`) +
      `<a class="btn wa" href="${waUrl_(r.phone, msg)}" target="_blank" rel="noopener">${ICON.wa}Tell the patient on WhatsApp</a>` +
      listButton_(p.pin) });
  }

  // The booking, with the choices to approve. Approving needs this tap,
  // so a link preview that opens the link cannot approve anything by itself.
  const url = ScriptApp.getService().getUrl();
  const iso = isoDate_(r.preferred);
  const hidden = `<input type="hidden" name="id" value="${esc_(r.id)}"><input type="hidden" name="t" value="${esc_(p.t)}"><input type="hidden" name="pin" value="${esc_(p.pin)}">`;
  const row_ = (k, v, wide) => `<div${wide ? ' class="wide"' : ''}><dt>${k}</dt><dd>${v}</dd></div>`;
  return page_({ title: 'New booking', back: p.pin, body: `
    <section class="card">
      <h2 class="pname">${esc_(r.name)}</h2>
      <p class="when">${esc_(dayLabel_(r.preferred))}, ${esc_(r.preferredTime)}</p>
      <div class="pair">
        <a class="btn line" href="tel:${esc_(r.phone)}">${ICON.phone}Call</a>
        <a class="btn line" href="${waUrl_(r.phone)}" target="_blank" rel="noopener">${ICON.wa}WhatsApp</a>
      </div>
    </section>
    <section class="card">
      <dl class="rows">
        ${row_('Phone', esc_(r.phone))}
        ${row_('Doctor asked for', esc_(r.doctor || 'No preference'))}
        ${row_('Department', esc_(r.department))}
        ${row_('Preferred day', esc_(r.preferred), true)}
        ${r.message ? row_('Note', esc_(r.message), true) : ''}
        ${row_('Request', esc_(r.id))}
      </dl>
    </section>
    <form class="card" method="get" action="${url}" target="_top">
      ${hidden}
      <h3>Confirm the appointment</h3>
      <label>Doctor<select name="doctor"><option value="">Not assigned (no calendar)</option>${CONFIG.DOCTORS.map(d => `<option${d === r.doctor ? ' selected' : ''}>${esc_(d)}</option>`).join('')}</select></label>
      <label>Date<input type="date" name="cdate" value="${iso}" required></label>
      <label>Time<select name="ctime">${CONFIG.SESSIONS.map(sess => `<optgroup label="${sess[0]}">${slots_([sess]).map(t => `<option${timeLabel_(t) === r.preferredTime ? ' selected' : ''}>${timeLabel_(t)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <button class="btn primary" name="do" value="approve">${ICON.tick}Approve and add to calendar</button>
    </form>
    <details class="card">
      <summary>Decline this booking ${ICON.down}</summary>
      <form method="get" action="${url}" target="_top">
        ${hidden}
        <label>Reason (optional, goes in the message to the patient)<input type="text" name="reason" maxlength="300"></label>
        <button class="btn line danger" name="do" value="decline">Decline</button>
      </form>
    </details>` });
}

// The PIN screen, unless the right PIN came with the request. This phone remembers the PIN after the first time.
function pinGate_(p) {
  const pin = PropertiesService.getScriptProperties().getProperty('RECEPTION_PIN');
  if (!pin) return page_({ title: 'Set up', body: result_('cross', 'Reception PIN not set', 'Add RECEPTION_PIN in Apps Script under Project Settings, Script properties, then open this page again.') });
  if (p.pin === pin) return null;
  const url = ScriptApp.getService().getUrl();
  return page_({ title: 'Reception', body: `
    <form class="card pin" method="get" action="${url}" target="_top" id="pinform">
      <span class="ring">${ICON.lock}</span>
      <h2>Reception only</h2>
      <p class="muted">Enter the reception PIN to see bookings.</p>
      ${p.pin ? '<p class="err">That PIN is not right. Try again.</p>' : ''}
      ${['view', 'day', 'id', 't'].filter(k => p[k]).map(k => `<input type="hidden" name="${k}" value="${esc_(p[k])}">`).join('')}
      <input type="password" name="pin" inputmode="numeric" autocomplete="off" aria-label="PIN" required autofocus>
      <button class="btn primary">Continue</button>
    </form>
    <script>
      try {
        var f = document.getElementById('pinform'), saved = localStorage.getItem('rnh-pin');
        ${p.pin ? "localStorage.removeItem('rnh-pin'); saved = null;" : ''}
        if (saved) { f.pin.value = saved; f.submit(); }
        f.addEventListener('submit', function () { localStorage.setItem('rnh-pin', f.pin.value); });
      } catch (e) {}
    </script>` });
}

/* ---------------- Reception's list of bookings waiting for a decision ---------------- */

function pendingPage_(pin) {
  const url = ScriptApp.getService().getUrl();
  const values = sheet_().getDataRange().getDisplayValues().slice(1);
  const pending = values.filter(v => v[COL['Status'] - 1] === 'Pending').reverse(); // newest first
  const items = pending.map(v => {
    const href = `${url}?id=${encodeURIComponent(v[COL['Request ID'] - 1])}&t=${encodeURIComponent(v[COL['Token'] - 1])}&pin=${encodeURIComponent(pin)}`;
    const name = v[COL['Name'] - 1], day = dayLabel_(v[COL['Preferred date'] - 1]);
    const doctor = v[COL['Doctor'] - 1] && v[COL['Doctor'] - 1] !== 'No preference' ? v[COL['Doctor'] - 1] : 'No preference';
    return `<a class="booking" href="${href}" target="_top">
      <span class="avatar">${esc_(name.trim().charAt(0).toUpperCase())}</span>
      <span class="b-main">
        <strong>${esc_(name)}</strong>
        <span class="b-when${day === 'Today' ? ' is-today' : ''}">${esc_(day)}, ${esc_(v[COL['Preferred time'] - 1])}</span>
        <span class="b-meta">${esc_(doctor)}</span>
      </span>
      ${ICON.next}
    </a>`;
  }).join('');
  return page_({ title: 'Bookings', count: pending.length, tabs: { at: 'waiting', pin, waiting: pending.length }, body:
    (pending.length
      ? `<p class="lead">${pending.length === 1 ? '1 booking is' : pending.length + ' bookings are'} waiting. Tap one to approve.</p>${items}`
      : `<section class="card empty"><span class="ring calm">${ICON.tick}</span><h2>All caught up</h2><p class="muted">New WhatsApp bookings appear here. Tap Refresh after one comes in.</p></section>`) +
    `<div class="dock"><a class="btn primary" href="${url}?view=reception&pin=${encodeURIComponent(pin)}" target="_top">${ICON.refresh}Refresh</a></div>` });
}

/* ---------------- Reception's schedule: every doctor's appointments for one day ---------------- */

function schedulePage_(pin, dayIso) {
  const tz = CONFIG.TIMEZONE, url = ScriptApp.getService().getUrl();
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(dayIso || '') ? dayIso : today;
  const start = Utilities.parseDate(iso + ' 00:00', tz, 'yyyy-MM-dd HH:mm');
  const end = new Date(start.getTime() + 864e5);
  const step = n => Utilities.formatDate(new Date(start.getTime() + n * 864e5 + 12 * 36e5), tz, 'yyyy-MM-dd');
  const go = day => `${url}?view=schedule&day=${day}&pin=${encodeURIComponent(pin)}`;

  // Straight from each doctor's calendar, so moves, cancellations and hand-made entries all show.
  // Reading four calendars is the slow part, so a day is kept for two minutes (an approval clears it at once).
  const cache = CacheService.getScriptCache(), key = 'schedule ' + iso;
  const kept = cache.get(key);
  const doctors = kept ? JSON.parse(kept) : CONFIG.DOCTORS.map(doctor => {
    const cal = existingCalendar_(doctor);
    const events = cal ? cal.getEvents(start, end).filter(e => !e.isAllDayEvent()).sort((a, b) => a.getStartTime() - b.getStartTime()) : [];
    return { doctor, color: colorOf_(doctor)[1], events: events.map(e => {
      const m = /^(.*?)(?: \((.+)\))?$/.exec(e.getTitle());
      return { time: Utilities.formatDate(e.getStartTime(), tz, 'h:mm a').toLowerCase(), name: m[1], dept: m[2] || '', phone: ((e.getDescription() || '').match(/Phone: (.+)/) || [])[1] || '' };
    }) };
  });
  if (!kept) cache.put(key, JSON.stringify(doctors), 120);
  const total = doctors.reduce((n, d) => n + d.events.length, 0);
  const label = dayLabel_(prettyDate_(iso));

  const cards = doctors.map(d => `<section class="card doc">
      <h2 class="doc-head"><span class="dot" style="background:${d.color}"></span><span>${esc_(d.doctor)}</span><span class="doc-n">${d.events.length || ''}</span></h2>
      ${d.events.length ? `<ul class="slots">${d.events.map(ev => `<li>${ev.phone ? `<a href="tel:${esc_(ev.phone)}">` : '<div>'}
        <span class="slot-t" style="color:${d.color}">${esc_(ev.time)}</span>
        <span class="slot-p"><strong>${esc_(ev.name)}</strong>${ev.dept ? `<span>${esc_(ev.dept)}</span>` : ''}</span>
        ${ev.phone ? ICON.phone + '</a>' : '</div>'}</li>`).join('')}</ul>`
        : '<p class="muted">No appointments</p>'}
    </section>`).join('');

  return page_({ title: 'Schedule', tabs: { at: 'schedule', pin, waiting: countPending_() }, body: `
    <nav class="days" aria-label="Choose a day">
      <a class="day-btn" href="${go(step(-1))}" target="_top" aria-label="Previous day">${ICON.back}</a>
      <div class="day-now"><strong>${esc_(label)}</strong><span>${esc_(prettyDate_(iso))}</span></div>
      <a class="day-btn" href="${go(step(1))}" target="_top" aria-label="Next day">${ICON.next}</a>
    </nav>
    <p class="lead">${total ? `${total} appointment${total === 1 ? '' : 's'} across all doctors.` : 'No appointments on this day.'}</p>
    ${cards}
    <div class="dock"><a class="btn primary" href="${go(today)}" target="_top">${iso === today ? ICON.refresh + 'Refresh' : ICON.list + 'Back to today'}</a></div>` });
}
function countPending_() {
  return sheet_().getDataRange().getDisplayValues().slice(1).filter(v => v[COL['Status'] - 1] === 'Pending').length;
}

// "Thursday, 12 November 2026" -> "Today", "Tomorrow" or "Thu 12 Nov"
function dayLabel_(pretty) {
  const iso = isoDate_(pretty);
  if (!iso) return pretty;
  const day = n => Utilities.formatDate(new Date(Date.now() + n * 864e5), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  if (iso === day(0)) return 'Today';
  if (iso === day(1)) return 'Tomorrow';
  if (iso === day(-1)) return 'Yesterday';
  const [y, m, d] = iso.split('-').map(Number);
  return Utilities.formatDate(new Date(y, m - 1, d), CONFIG.TIMEZONE, 'EEE d MMM');
}
function result_(kind, heading, text) {
  return `<section class="card result"><span class="ring ${kind}">${ICON[kind]}</span><h2>${heading}</h2><p>${text}</p></section>`;
}
function listButton_(pin) {
  return `<a class="btn line" href="${ScriptApp.getService().getUrl()}?view=reception&pin=${encodeURIComponent(pin || '')}" target="_top">${ICON.list}All bookings</a>`;
}

const ICON = (() => {
  const i = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  return {
    phone: i('<path d="M5 3.5h3.2l1.6 4.2-2 1.3a11 11 0 0 0 7.2 7.2l1.3-2 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5z"/>'),
    wa: i('<path d="M4.6 19.4l1.1-3.4a8 8 0 1 1 2.8 2.6z"/><path d="M9.3 8.6c.3-.4.7-.5 1-.4l.9 2-.6.8a5.6 5.6 0 0 0 2.4 2.4l.8-.6 2 .9c.1.3 0 .7-.4 1-.8.4-2 .3-3.4-.6a9.2 9.2 0 0 1-3-3c-.9-1.4-1-2.6-.7-3.5z"/>'),
    tick: i('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    cross: i('<path d="M6 6l12 12M18 6 6 18"/>'),
    lock: i('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    next: i('<path d="M9.5 6l6 6-6 6"/>'),
    down: i('<path d="m6 9.5 6 6 6-6"/>'),
    back: i('<path d="M14.5 6 8.5 12l6 6"/>'),
    list: i('<path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01"/>'),
    refresh: i('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>')
  };
})();

/* ---------------- Doctors' calendars ---------------- */

// The doctor's calendar if there is one yet: named in DOCTOR_CALENDARS, or made earlier by this script
function existingCalendar_(doctor) {
  const id = CONFIG.DOCTOR_CALENDARS[doctor] || PropertiesService.getScriptProperties().getProperty('CAL ' + doctor);
  return (id && CalendarApp.getCalendarById(id)) || null;
}
// ...or a new one, in the doctor's own colour
function doctorCalendar_(doctor) {
  const found = existingCalendar_(doctor);
  if (found) return found;
  const cal = CalendarApp.createCalendar(doctor + ' - Ratna appointments', { timeZone: CONFIG.TIMEZONE, color: CalendarApp.Color[colorOf_(doctor)[0]] });
  PropertiesService.getScriptProperties().setProperty('CAL ' + doctor, cal.getId());
  return cal;
}
// Run once from the Apps Script editor to give calendars made before version 8 their doctors' colours
function colourDoctorCalendars() {
  CONFIG.DOCTORS.forEach(doctor => { const cal = existingCalendar_(doctor); if (cal) cal.setColor(CalendarApp.Color[colorOf_(doctor)[0]]); });
}

// One 30-minute event at the confirmed time; returns its ID, or '' when the date or time is missing
function addToCalendar_(r, doctor, iso, timeLabel) {
  const m = /(\d{1,2}):(\d{2})\s*(am|pm)/i.exec(timeLabel || '');
  if (!iso || !m) return '';
  const h = (Number(m[1]) % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0);
  const start = Utilities.parseDate(`${iso} ${String(h).padStart(2, '0')}:${m[2]}`, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
  const end = new Date(start.getTime() + CONFIG.SLOT_MINUTES * 60000);
  const ev = doctorCalendar_(doctor).createEvent(`${r.name} (${r.department})`, start, end, {
    location: CONFIG.HOSPITAL_ADDRESS,
    description: `Request ${r.id}\nPhone: ${r.phone}${r.message ? '\nNote: ' + r.message : ''}`
  });
  return ev.getId();
}

/* ---------------- WhatsApp ---------------- */

// WhatsApp needs the number with its country code: "98765 43210" or "098765 43210" -> "919876543210"
function waUrl_(phone, text) {
  let n = String(phone || '').replace(/\D/g, '');
  if (n.length === 11 && n[0] === '0') n = n.slice(1);
  if (n.length === 10) n = '91' + n;
  return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
}

/* ---------------- Helpers ---------------- */

let sheetMemo_ = null;
function sheet_() {
  if (sheetMemo_) return sheetMemo_;
  const ss = book_();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  const cache = CacheService.getScriptCache();
  if (sh && cache.get('headings-ok')) return (sheetMemo_ = sh);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_NAME, 0);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0B2A6F').setFontColor('#FFFFFF');
    sh.hideColumns(COL['Token']);
  } else if (sh.getRange(1, COL['Preferred time']).getValue() !== 'Preferred time') {
    sh.insertColumnAfter(COL['Preferred date']);
    sh.getRange(1, COL['Preferred time']).setValue('Preferred time');
  }
  if (sh.getRange(1, COL['Doctor']).getValue() !== 'Doctor') {
    sh.getRange(1, COL['Doctor'], 1, 2).setValues([['Doctor', 'Calendar event']]).setFontWeight('bold').setBackground('#0B2A6F').setFontColor('#FFFFFF');
  }
  cache.put('headings-ok', '1', 21600);
  return (sheetMemo_ = sh);
}

// The spreadsheet that holds the Appointments tab, wherever this script lives
function book_() {
  if (CONFIG.SHEET_ID) return SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('SHEET_ID');
  if (saved) return SpreadsheetApp.openById(saved);
  const made = SpreadsheetApp.create('Ratna Nursing Home - Appointments');
  props.setProperty('SHEET_ID', made.getId());
  return made;
}

function findRequest_(id, token) {
  if (!id || !token) return null;
  const sh = sheet_();
  const values = sh.getDataRange().getDisplayValues();
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (v[COL['Request ID'] - 1] === id && v[COL['Token'] - 1] === token) {
      return {
        row: i + 1,
        r: {
          id, status: v[COL['Status'] - 1], name: v[COL['Name'] - 1], phone: v[COL['Phone'] - 1],
          department: v[COL['Department'] - 1], preferred: v[COL['Preferred date'] - 1], preferredTime: v[COL['Preferred time'] - 1] || 'Any time',
          message: v[COL['Message'] - 1], decidedAt: v[COL['Decided at'] - 1], doctor: (v[COL['Doctor'] - 1] || '').replace('No preference', '')
        }
      };
    }
  }
  return null;
}

function newId_() { return 'RNH-' + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyMMdd') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0'); }

// Start times of every bookable appointment, e.g. ['10:00', '10:30', ... '19:30']
function slots_(sessions) {
  const toMin = t => t.split(':').map(Number).reduce((h, m) => h * 60 + m);
  const out = [];
  (sessions || CONFIG.SESSIONS).forEach(([, from, to]) => {
    for (let t = toMin(from); t + CONFIG.SLOT_MINUTES <= toMin(to); t += CONFIG.SLOT_MINUTES) {
      out.push(String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'));
    }
  });
  return out;
}
function timeLabel_(hhmm) { const [h, m] = hhmm.split(':').map(Number); return ((h + 11) % 12 + 1) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' am' : ' pm'); }
function isSunday_(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).getDay() === 0; }
function clean_(v, max) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, max); }
// Stop a value like "=HYPERLINK(...)" being read as a formula in the sheet
function safe_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }
function esc_(v) { return String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function prettyDate_(iso) { const [y, m, d] = iso.split('-').map(Number); return Utilities.formatDate(new Date(y, m - 1, d), CONFIG.TIMEZONE, 'EEEE, d MMMM yyyy'); }
// "Tuesday, 3 November 2026" -> "2026-11-03" ("Any day" -> "")
function isoDate_(pretty) {
  const m = String(pretty).match(/(\d{1,2}) ([A-Za-z]+) (\d{4})/);
  if (!m) return '';
  const month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(m[2].toLowerCase()) + 1;
  return month ? `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}` : '';
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Every reception screen. The viewport has to be set here: Google ignores one written inside the page,
// which is what made the screens tiny on phones.
function page_({ title, body, back, count, tabs }) {
  const list = back ? `${ScriptApp.getService().getUrl()}?view=reception&pin=${encodeURIComponent(back)}` : '';
  return HtmlService.createHtmlOutput(`<style>
    :root{--ink:#0B2A6F;--red:#C8102E;--green:#13804A;--fog:#F2F5FA;--line:#DCE2EE;--slate:#4F5B74}
    *{box-sizing:border-box}
    html{-webkit-text-size-adjust:100%}
    body{margin:0;background:var(--fog);color:var(--ink);font:17px/1.5 -apple-system,"Segoe UI",Roboto,Arial,sans-serif}
    svg{width:22px;height:22px;flex:none}
    .bar{position:sticky;top:0;z-index:2;background:var(--ink);color:#fff;padding:14px 16px 16px}
    .bar-in{max-width:640px;margin:0 auto;display:flex;align-items:center;gap:14px}
    .org{display:block;font-size:13px;color:#BAC6DE}
    .bar h1{margin:0;font:400 26px/1.15 Georgia,serif}
    .back{display:grid;place-items:center;width:46px;height:46px;flex:none;border-radius:50%;background:rgba(255,255,255,.14);color:#fff}
    .count{margin-left:auto;min-width:46px;height:46px;padding:0 12px;border-radius:999px;background:var(--red);display:grid;place-items:center;font-weight:700;font-size:19px}
    main{max-width:640px;margin:0 auto;padding:18px 16px 120px;display:grid;gap:14px}
    .card{background:#fff;border-radius:22px;padding:20px;box-shadow:0 1px 0 rgba(11,42,111,.05),0 16px 32px -24px rgba(11,42,111,.5)}
    .lead{margin:2px 4px;color:var(--slate);font-size:16px}
    .muted{color:var(--slate);margin:0}
    .booking{display:flex;align-items:center;gap:14px;min-height:92px;padding:16px 14px 16px 16px;border-radius:22px;background:#fff;color:inherit;text-decoration:none;box-shadow:0 1px 0 rgba(11,42,111,.05),0 16px 32px -24px rgba(11,42,111,.5)}
    .booking:active{background:#E8EDF6}
    .booking>svg{color:#9AA7C2}
    .avatar{width:54px;height:54px;flex:none;border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;font-size:22px;font-weight:700}
    .b-main{flex:1;min-width:0;display:grid;gap:2px}
    .b-main strong{font-size:19px;line-height:1.25}
    .b-when{font-weight:700;font-size:16px}
    .b-when.is-today{color:var(--red)}
    .b-meta{color:var(--slate);font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:58px;padding:0 20px;border:0;border-radius:16px;font:inherit;font-weight:700;font-size:17px;text-decoration:none;cursor:pointer}
    .btn.primary{background:var(--red);color:#fff}
    .btn.wa{background:var(--green);color:#fff}
    .btn.line{background:#fff;color:var(--ink);box-shadow:inset 0 0 0 2px var(--line)}
    .btn.danger{color:var(--red);box-shadow:inset 0 0 0 2px #F2C4CC}
    .pair{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
    .pname{margin:0;font:400 30px/1.15 Georgia,serif}
    .when{margin:6px 0 0;font-size:20px;font-weight:700}
    .rows{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:18px 16px}
    .rows div{min-width:0}
    .rows .wide{grid-column:1/-1}
    .rows dt{margin-bottom:2px;color:var(--slate);font-size:14px}
    .rows dd{margin:0;font-weight:600;overflow-wrap:anywhere}
    form{display:grid;gap:16px;margin:0}
    h3{margin:0;font:400 23px/1.2 Georgia,serif}
    label{display:grid;gap:8px;font-weight:700;font-size:15px}
    input,select{width:100%;min-height:58px;padding:0 16px;border:2px solid #C9D3E6;border-radius:14px;background:#fff;color:var(--ink);font:inherit;font-size:18px;font-weight:400}
    input:focus,select:focus{outline:none;border-color:var(--ink)}
    details summary{display:flex;align-items:center;justify-content:space-between;min-height:30px;font-weight:700;cursor:pointer;list-style:none}
    details summary::-webkit-details-marker{display:none}
    details[open] summary{margin-bottom:16px}
    details[open] summary svg{transform:rotate(180deg)}
    .ring{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;margin:0 auto 8px;background:#E8EDF6;color:var(--ink)}
    .ring svg{width:40px;height:40px}
    .ring.tick,.ring.calm{background:#E3F4EA;color:var(--green)}
    .ring.cross{background:#FBE8EB;color:var(--red)}
    .result,.empty,.pin{text-align:center}
    .result h2,.empty h2,.pin h2{margin:0 0 6px;font:400 28px/1.2 Georgia,serif}
    .result p{margin:0;font-size:19px;line-height:1.55}
    .empty{padding:36px 20px}
    .note{margin:0 4px;color:var(--slate);font-size:15px;text-align:center}
    .pin{display:grid;gap:14px;padding:28px 20px}
    .pin .ring{margin-bottom:0}
    .pin input{text-align:center;font-size:30px;letter-spacing:.35em;min-height:64px}
    .err{margin:0;color:var(--red);font-weight:700}
    .dock{position:fixed;left:0;right:0;bottom:0;padding:16px 16px calc(14px + env(safe-area-inset-bottom));background:linear-gradient(rgba(242,245,250,0),var(--fog) 35%)}
    .dock .btn{max-width:608px;margin:0 auto}
    .tabs{margin:14px -16px -2px;padding:0 16px}
    .tabs-in{max-width:640px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:16px;background:rgba(255,255,255,.12)}
    .tabs a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px;border-radius:12px;color:#fff;font-weight:700;text-decoration:none}
    .tabs a[aria-current]{background:#fff;color:var(--ink)}
    .tabs a span{min-width:26px;height:26px;padding:0 7px;border-radius:999px;background:var(--red);color:#fff;display:grid;place-items:center;font-size:14px}
    .days{display:grid;grid-template-columns:54px 1fr 54px;align-items:center;gap:10px}
    .day-btn{display:grid;place-items:center;height:54px;border-radius:16px;background:#fff;color:var(--ink);box-shadow:inset 0 0 0 2px var(--line)}
    .day-now{text-align:center;display:grid}
    .day-now strong{font:400 24px/1.2 Georgia,serif}
    .day-now span{color:var(--slate);font-size:14px}
    .doc{padding:18px 18px 8px}
    .doc-head{display:flex;align-items:center;gap:10px;margin:0 0 6px;font-family:inherit;font-size:18px;font-weight:700;line-height:1.3}
    .dot{width:14px;height:14px;flex:none;border-radius:50%}
    .doc-n{margin-left:auto;min-width:30px;height:30px;padding:0 9px;border-radius:999px;background:var(--fog);display:grid;place-items:center;font-size:15px}
    .doc-n:empty{display:none}
    .doc .muted{padding:6px 0 12px}
    .slots{list-style:none;margin:0;padding:0}
    .slots li{border-top:1px solid var(--line)}
    .slots a,.slots li>div{display:flex;align-items:center;gap:14px;min-height:64px;padding:10px 0;color:inherit;text-decoration:none}
    .slots a>svg{margin-left:auto;color:#9AA7C2}
    .slot-t{flex:none;width:76px;font-weight:700;font-size:17px}
    .slot-p{display:grid;min-width:0}
    .slot-p strong{font-size:17px}
    .slot-p span{color:var(--slate);font-size:14px}
  </style>
  <header class="bar"><div class="bar-in">
    ${list ? `<a class="back" href="${list}" target="_top" aria-label="All bookings">${ICON.back}</a>` : ''}
    <div><span class="org">${CONFIG.HOSPITAL_NAME}</span><h1>${esc_(title)}</h1></div>
    ${count && !tabs ? `<span class="count" aria-label="${count} waiting">${count}</span>` : ''}
  </div>
  ${tabs ? `<nav class="tabs"><div class="tabs-in">
    <a href="${ScriptApp.getService().getUrl()}?view=reception&pin=${encodeURIComponent(tabs.pin)}" target="_top"${tabs.at === 'waiting' ? ' aria-current="page"' : ''}>Waiting${tabs.waiting ? `<span>${tabs.waiting}</span>` : ''}</a>
    <a href="${ScriptApp.getService().getUrl()}?view=schedule&pin=${encodeURIComponent(tabs.pin)}" target="_top"${tabs.at === 'schedule' ? ' aria-current="page"' : ''}>Schedule</a>
  </div></nav>` : ''}</header>
  <main>${body}</main>`)
    .setTitle(title + ' | ' + CONFIG.HOSPITAL_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

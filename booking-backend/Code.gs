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
 *
 * The reception PIN is kept in Project Settings > Script properties as RECEPTION_PIN, never in this file.
 * Setup steps are in booking-backend/SETUP.md.
 */

// Shown when the web app URL is opened in a browser, so you can see which code is live
const VERSION = 'Version 6: reception page, no link for patients';

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

/* ---------------- Reception's approval page (opened from the link in the WhatsApp message) ---------------- */

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.view === 'reception') return pinGate_(p) || pendingPage_(p.pin);
  if (!p.id) return page_('Booking service', `<p>The Ratna Nursing Home booking service is running.</p><p><strong>${VERSION}</strong></p>`);

  // Every request page is reception's: the PIN comes first
  const gate = pinGate_(p);
  if (gate) return gate;

  const found = findRequest_(p.id, p.t);
  if (!found) return page_('Request not found', `<p>This request is not in the Appointments sheet.</p>${backLink_(p.pin)}`);
  const { row, r } = found;

  if (r.status !== 'Pending') {
    return page_(`Already ${r.status.toLowerCase()}`, `<p>Request <strong>${esc_(r.id)}</strong> for ${esc_(r.name)} was ${esc_(r.status.toLowerCase())}${r.decidedAt ? ' on ' + esc_(r.decidedAt) : ''}.</p>${backLink_(p.pin)}`);
  }

  if (p.do === 'approve' || p.do === 'decline') {
    const sh = sheet_();
    const decided = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'd MMM yyyy, h:mm a');
    if (p.do === 'approve') {
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(p.cdate || '') ? p.cdate : isoDate_(r.preferred);
      const date = iso ? prettyDate_(iso) : r.preferred;
      const time = clean_(p.ctime, 40);
      const doctor = CONFIG.DOCTORS.indexOf(p.doctor) > -1 ? p.doctor : '';
      let eventNote = 'No doctor chosen, so nothing was added to a calendar.';
      if (doctor) {
        try {
          const ev = addToCalendar_(r, doctor, iso, time);
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
      return page_('Approved', `<p>Request <strong>${esc_(r.id)}</strong> is approved for <strong>${esc_(date)}${time ? ', ' + esc_(time) : ''}</strong>${doctor ? ' with ' + esc_(doctor) : ''}.</p>
        <p>${eventNote} The sheet is updated.</p>
        ${waButton_(r.phone, msg, 'Send confirmation on WhatsApp')}${backLink_(p.pin)}`);
    }
    sh.getRange(row, COL['Status']).setValue('Declined');
    sh.getRange(row, COL['Decided at']).setValue(decided);
    const reason = clean_(p.reason, 300);
    const msg = `Hello ${r.name}, we are not able to confirm your appointment request as sent.${reason ? ' ' + reason : ''} Please reply here or call ${CONFIG.HOSPITAL_PHONE} and we will find a time that works.`;
    return page_('Declined', `<p>Request <strong>${esc_(r.id)}</strong> is declined.</p>${waButton_(r.phone, msg, 'Tell the patient on WhatsApp')}${backLink_(p.pin)}`);
  }

  // Show the request with the choices to approve. Approving needs this click,
  // so a link preview that opens the link cannot approve anything by itself.
  const url = ScriptApp.getService().getUrl();
  const iso = isoDate_(r.preferred);
  const hidden = `<input type="hidden" name="id" value="${esc_(r.id)}"><input type="hidden" name="t" value="${esc_(p.t)}"><input type="hidden" name="pin" value="${esc_(p.pin)}">`;
  return page_('Review appointment request', `
    ${backLink_(p.pin, true)}
    <dl>
      <dt>Request</dt><dd>${esc_(r.id)}</dd>
      <dt>Name</dt><dd>${esc_(r.name)}</dd>
      <dt>Phone</dt><dd><a href="tel:${esc_(r.phone)}">${esc_(r.phone)}</a></dd>
      <dt>Doctor asked for</dt><dd>${esc_(r.doctor || 'No preference')}</dd>
      <dt>Department</dt><dd>${esc_(r.department)}</dd>
      <dt>Preferred day</dt><dd>${esc_(r.preferred)}</dd>
      <dt>Preferred time</dt><dd>${esc_(r.preferredTime)}</dd>
      <dt>Note</dt><dd>${esc_(r.message) || '&ndash;'}</dd>
    </dl>
    <form method="get" action="${url}" target="_top">
      ${hidden}
      <label>Doctor (the appointment goes on their calendar)<select name="doctor"><option value="">Not assigned (no calendar entry)</option>${CONFIG.DOCTORS.map(d => `<option${d === r.doctor ? ' selected' : ''}>${esc_(d)}</option>`).join('')}</select></label>
      <label>Appointment date<input type="date" name="cdate" value="${iso}" required></label>
      <label>Time<select name="ctime">${CONFIG.SESSIONS.map(sess => `<optgroup label="${sess[0]}">${slots_([sess]).map(t => `<option${timeLabel_(t) === r.preferredTime ? ' selected' : ''}>${timeLabel_(t)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <button name="do" value="approve" class="ok">Approve and add to the calendar</button>
    </form>
    <form method="get" action="${url}" target="_top" class="decline">
      ${hidden}
      <label>Reason (optional, goes in the message to the patient)<input type="text" name="reason" maxlength="300"></label>
      <button name="do" value="decline">Decline</button>
    </form>`);
}

// The PIN form, unless the right PIN came with the request. This phone remembers the PIN after the first time.
function pinGate_(p) {
  const pin = PropertiesService.getScriptProperties().getProperty('RECEPTION_PIN');
  if (!pin) return page_('Reception PIN not set', '<p>Add <strong>RECEPTION_PIN</strong> in Apps Script under <strong>Project Settings &gt; Script properties</strong>, then open this link again.</p>');
  if (p.pin === pin) return null;
  const url = ScriptApp.getService().getUrl();
  const wrong = p.pin ? '<p style="color:#C8102E">That PIN is not right. Try again.</p>' : '';
  return page_('Reception only', `${wrong}<p>Enter the reception PIN to see bookings.</p>
    <form method="get" action="${url}" target="_top" id="pinform">
      ${['view', 'id', 't'].filter(k => p[k]).map(k => `<input type="hidden" name="${k}" value="${esc_(p[k])}">`).join('')}
      <label>PIN<input type="password" name="pin" inputmode="numeric" autocomplete="off" required></label>
      <button class="ok">Continue</button>
    </form>
    <script>
      try {
        var f = document.getElementById('pinform'), saved = localStorage.getItem('rnh-pin');
        ${p.pin ? "localStorage.removeItem('rnh-pin'); saved = null;" : ''}
        if (saved) { f.pin.value = saved; f.submit(); }
        f.addEventListener('submit', function () { localStorage.setItem('rnh-pin', f.pin.value); });
      } catch (e) {}
    </script>`);
}

/* ---------------- Reception's list of bookings waiting for a decision ---------------- */

function pendingPage_(pin) {
  const url = ScriptApp.getService().getUrl();
  const values = sheet_().getDataRange().getDisplayValues().slice(1);
  const pending = values.filter(v => v[COL['Status'] - 1] === 'Pending').reverse(); // newest first
  const items = pending.map(v => {
    const href = `${url}?id=${encodeURIComponent(v[COL['Request ID'] - 1])}&t=${encodeURIComponent(v[COL['Token'] - 1])}&pin=${encodeURIComponent(pin)}`;
    const doctor = v[COL['Doctor'] - 1] && v[COL['Doctor'] - 1] !== 'No preference' ? v[COL['Doctor'] - 1] : 'No preference';
    return `<li><a href="${href}" target="_top"><strong>${esc_(v[COL['Name'] - 1])}</strong>
      <span>${esc_(v[COL['Preferred date'] - 1])}, ${esc_(v[COL['Preferred time'] - 1])}</span>
      <span>${esc_(doctor)}, ${esc_(v[COL['Phone'] - 1])}</span></a></li>`;
  }).join('');
  return page_('Pending bookings', `<p>${pending.length ? `${pending.length} waiting for a decision. Tap one to approve or decline.` : 'Nothing waiting. New WhatsApp bookings appear here.'}</p>
    ${pending.length ? `<ul class="list">${items}</ul>` : ''}
    <p><a href="${url}?view=reception&pin=${encodeURIComponent(pin)}" target="_top">Refresh</a></p>`);
}
function backLink_(pin, top) {
  return `<p style="margin:${top ? '0 0 16px' : '20px 0 0'}"><a href="${ScriptApp.getService().getUrl()}?view=reception&pin=${encodeURIComponent(pin || '')}" target="_top">&larr; All pending bookings</a></p>`;
}

/* ---------------- Doctors' calendars ---------------- */

// The doctor's calendar: one named in DOCTOR_CALENDARS, or one this script made earlier, or a new one
function doctorCalendar_(doctor) {
  const props = PropertiesService.getScriptProperties();
  const id = CONFIG.DOCTOR_CALENDARS[doctor] || props.getProperty('CAL ' + doctor);
  const found = id && CalendarApp.getCalendarById(id);
  if (found) return found;
  const cal = CalendarApp.createCalendar(doctor + ' - Ratna appointments', { timeZone: CONFIG.TIMEZONE, color: CalendarApp.Color.BLUE });
  props.setProperty('CAL ' + doctor, cal.getId());
  return cal;
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
  return 'https://wa.me/' + n + '?text=' + encodeURIComponent(text);
}
function waButton_(phone, text, label) {
  return `<p style="margin:20px 0 0"><a href="${waUrl_(phone, text)}" target="_blank" rel="noopener" style="display:block;text-align:center;padding:14px;border-radius:999px;background:#13804A;color:#FFFFFF;font-weight:600;text-decoration:none">${esc_(label)}</a></p>`;
}

/* ---------------- Helpers ---------------- */

function sheet_() {
  const ss = book_();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
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
  return sh;
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

function page_(title, body) {
  return HtmlService.createHtmlOutput(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#0B2A6F;background:#F2F5FA;margin:0;padding:24px}
    main{max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:28px;box-shadow:0 20px 50px -30px rgba(11,42,111,.4)}
    h1{font-family:Georgia,serif;font-weight:400;font-size:28px;margin:0 0 18px}
    dl{display:grid;grid-template-columns:130px 1fr;gap:8px 12px;margin:0 0 22px}dt{color:#4F5B74}dd{margin:0}
    form{display:grid;gap:12px;margin-top:16px}label{display:grid;gap:6px;font-weight:600;font-size:14px}
    input,select{font:inherit;padding:12px;border:1px solid #B9C4D8;border-radius:10px;background:#fff}
    button{font:inherit;font-weight:600;padding:14px;border-radius:999px;border:1px solid #0B2A6F;background:#fff;color:#0B2A6F;cursor:pointer}
    button.ok{background:#C8102E;border-color:#C8102E;color:#fff}.decline{padding-top:16px;border-top:1px solid #DCE2EE}
    a{color:#0B2A6F;font-weight:600}
    .list{list-style:none;margin:0 0 16px;padding:0;display:grid;gap:10px}
    .list a{display:grid;gap:2px;padding:14px 16px;border:1px solid #DCE2EE;border-radius:14px;text-decoration:none;font-weight:400}
    .list strong{font-size:17px}.list span{color:#4F5B74;font-size:14px}
  </style><main><p style="margin:0 0 4px;color:#4F5B74;font-size:13px">${CONFIG.HOSPITAL_NAME}</p><h1>${esc_(title)}</h1>${body}</main>`)
    .setTitle(title + ' | ' + CONFIG.HOSPITAL_NAME);
}

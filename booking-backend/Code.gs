/**
 * Ratna Nursing Home: appointment requests.
 *
 * Lives inside a Google Sheet (Extensions > Apps Script) and is deployed as a web app.
 *  1. The website posts a request here. It is saved as a row in the "Appointments" sheet,
 *     then the website hands the patient to a WhatsApp chat with reception (WHATSAPP_NUMBER).
 *  2. The hospital gets an email with the details, a "Review and approve" button and a WhatsApp link to the patient.
 *     If the patient gave an email, they get one saying the request is received and waiting for confirmation.
 *  3. The hospital opens the button's page, sets the date, time and doctor, and approves (or declines).
 *     The sheet row is updated, the appointment goes on that doctor's Google Calendar, and the page offers
 *     a ready-written WhatsApp confirmation to the patient (plus an email, if they gave one).
 *
 * Setup steps are in booking-backend/SETUP.md.
 */

// Shown when the web app URL is opened in a browser, so you can see which code is live
const VERSION = 'Version 4: WhatsApp and doctors\' calendars';

const CONFIG = {
  HOSPITAL_EMAIL: 'madhujersey9999@gmail.com', // TESTING ONLY: change to the hospital's own address before going live
  HOSPITAL_NAME: 'Ratna Nursing Home',
  HOSPITAL_PHONE: '08819 222250',
  HOSPITAL_ADDRESS: 'Peketi Vari Street, Near Railway Over Bridge, Sajjapuram, Tanuku 534211',
  OPD_HOURS: 'Monday to Saturday, 10 am to 2 pm and 5 pm to 8 pm',
  // Bookable OPD sessions (Monday to Saturday), split into 30-minute appointments. Keep in step with BOOKING in build/data.mjs.
  SESSIONS: [['Morning', '10:00', '14:00'], ['Evening', '17:00', '20:00']],
  SLOT_MINUTES: 30,
  SHEET_NAME: 'Appointments',
  // Reception's WhatsApp number, in international form without + (bookings arrive here from the website)
  WHATSAPP_NUMBER: '918179898615',
  // The doctors patients can choose. Keep in step with DOCTORS in build/data.mjs.
  DOCTORS: ['Dr. Valluri Soma Sekhar', 'Dr. Valluri Subba Lakshmi', 'Dr. Valluri Amrutha Ratna', 'Dr. Bikkina Ghana Syam'],
  // Optional: a Google Calendar ID for a doctor, to use a calendar that already exists.
  // Left out, the script makes "<doctor> - Ratna appointments" in this account the first time it is needed;
  // share each one with its doctor (see SETUP.md).
  DOCTOR_CALENDARS: {},
  // Optional. Only needed when this script is NOT opened from the sheet (Extensions > Apps Script):
  // paste the sheet's ID, the long code in its address between /d/ and /edit. Left empty, a script made
  // from inside the sheet uses that sheet, and a standalone script makes its own 'Appointments' sheet.
  SHEET_ID: '',
  TIMEZONE: 'Asia/Kolkata'
};

const DEPARTMENTS = {
  'general-medicine': 'General Medicine',
  'obstetrics-gynaecology': 'Obstetrics & Gynaecology',
  'ultrasound': 'Ultrasound Scanning',
  'infertility': 'Infertility Treatment',
  'laparoscopic-surgery': 'Laparoscopic Surgery',
  'not-sure': 'Not sure yet'
};

// New columns go at the end, so rows saved by earlier versions keep their places
const HEADERS = ['Request ID', 'Received', 'Status', 'Name', 'Phone', 'Email', 'Department', 'Preferred date', 'Preferred time', 'Message',
  'Confirmed date', 'Confirmed time', 'Decided at', 'Source', 'Token', 'Doctor', 'Calendar event'];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));

/* ---------------- Website -> new request ---------------- */

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.company) return json_({ ok: true }); // honeypot: bots fill the hidden field, people never see it

  const req = {
    name: clean_(p.name, 80),
    phone: clean_(p.phone, 20),
    email: clean_(p.email, 120).toLowerCase(),
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
  if (req.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(req.email)) errors.push('email');
  if (!req.date || isSunday_(req.date)) errors.push('date');
  if (!req.time) errors.push('time');
  if (errors.length) return json_({ ok: false, errors, version: VERSION });

  req.id = 'RNH-' + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyMMdd') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  req.token = Utilities.getUuid();

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    sheet_().appendRow([req.id, new Date(), 'Pending', safe_(req.name), "'" + req.phone, safe_(req.email), req.department,
      "'" + (req.date ? prettyDate_(req.date) : 'Any day'), "'" + (req.time ? timeLabel_(req.time) : 'Any time'), safe_(req.message), '', '', '', req.source, req.token, req.doctor || 'No preference', '']);
  } finally {
    lock.releaseLock();
  }

  emailHospitalNewRequest_(req);
  if (req.email) emailPatientReceived_(req);
  return json_({ ok: true, id: req.id, version: VERSION });
}

/* ---------------- Hospital's approval page ---------------- */

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!p.id) return page_('Booking service', `<p>The Ratna Nursing Home booking service is running.</p><p><strong>${VERSION}</strong></p>`);

  const found = findRequest_(p.id, p.t);
  if (!found) return page_('Request not found', '<p>This link is not valid. Open the latest email for this request, or check the Appointments sheet.</p>');
  const { row, r } = found;

  if (r.status !== 'Pending') {
    return page_(`Already ${r.status.toLowerCase()}`, `<p>Request <strong>${esc_(r.id)}</strong> for ${esc_(r.name)} was ${esc_(r.status.toLowerCase())}${r.decidedAt ? ' on ' + esc_(r.decidedAt) : ''}.</p>`);
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
      if (r.email) emailPatientApproved_(r, date, time, doctor);
      const msg = `Hello ${r.name}, your appointment at ${CONFIG.HOSPITAL_NAME} is confirmed for ${date}${time ? ', ' + time : ''}${doctor ? ' with ' + doctor : ''}. Request ${r.id}.\nAddress: ${CONFIG.HOSPITAL_ADDRESS}.\nPlease bring any earlier reports and prescriptions. To change or cancel, reply here or call ${CONFIG.HOSPITAL_PHONE}.`;
      return page_('Approved', `<p>Request <strong>${esc_(r.id)}</strong> is approved for <strong>${esc_(date)}${time ? ', ' + esc_(time) : ''}</strong>${doctor ? ' with ' + esc_(doctor) : ''}.</p>
        <p>${eventNote} The sheet is updated${r.email ? ', and ' + esc_(r.name) + ' has been emailed' : ''}.</p>
        ${waButton_(r.phone, msg, 'Send confirmation on WhatsApp')}`);
    }
    sh.getRange(row, COL['Status']).setValue('Declined');
    sh.getRange(row, COL['Decided at']).setValue(decided);
    const reason = clean_(p.reason, 300);
    if (r.email) emailPatientDeclined_(r, reason);
    const msg = `Hello ${r.name}, we are not able to confirm your appointment request ${r.id} as sent.${reason ? ' ' + reason : ''} Please reply here or call ${CONFIG.HOSPITAL_PHONE} and we will find a time that works.`;
    return page_('Declined', `<p>Request <strong>${esc_(r.id)}</strong> is declined${r.email ? ', and ' + esc_(r.name) + ' has been emailed' : ''}.</p>${waButton_(r.phone, msg, 'Tell the patient on WhatsApp')}`);
  }

  // Show the request with a form to set the date and time. Approving needs this click,
  // so email link scanners that open the link cannot approve anything by themselves.
  const url = ScriptApp.getService().getUrl();
  const iso = isoDate_(r.preferredRaw);
  return page_('Review appointment request', `
    <dl>
      <dt>Request</dt><dd>${esc_(r.id)}</dd>
      <dt>Name</dt><dd>${esc_(r.name)}</dd>
      <dt>Phone</dt><dd><a href="tel:${esc_(r.phone)}">${esc_(r.phone)}</a></dd>
      <dt>Email</dt><dd>${esc_(r.email) || '&ndash;'}</dd>
      <dt>Department</dt><dd>${esc_(r.department)}</dd>
      <dt>Doctor asked for</dt><dd>${esc_(r.doctor || 'No preference')}</dd>
      <dt>Preferred date</dt><dd>${esc_(r.preferred)}</dd>
      <dt>Preferred time</dt><dd>${esc_(r.preferredTime)}</dd>
      <dt>Message</dt><dd>${esc_(r.message) || '&ndash;'}</dd>
    </dl>
    <form method="get" action="${url}" target="_top">
      <input type="hidden" name="id" value="${esc_(r.id)}"><input type="hidden" name="t" value="${esc_(p.t)}">
      <label>Appointment date<input type="date" name="cdate" value="${iso}" required></label>
      <label>Doctor (the appointment goes on their calendar)<select name="doctor"><option value="">Not assigned (no calendar entry)</option>${CONFIG.DOCTORS.map(d => `<option${d === r.doctor ? ' selected' : ''}>${esc_(d)}</option>`).join('')}</select></label>
      <label>Time<select name="ctime">${CONFIG.SESSIONS.map(sess => `<optgroup label="${sess[0]}">${slots_([sess]).map(t => `<option${timeLabel_(t) === r.preferredTime ? ' selected' : ''}>${timeLabel_(t)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <button name="do" value="approve" class="ok">Approve and add to the calendar</button>
    </form>
    <form method="get" action="${url}" target="_top" class="decline">
      <input type="hidden" name="id" value="${esc_(r.id)}"><input type="hidden" name="t" value="${esc_(p.t)}">
      <label>Reason (optional, sent to the patient)<input type="text" name="reason" maxlength="300"></label>
      <button name="do" value="decline">Decline</button>
    </form>`);
}

/* ---------------- Emails ---------------- */

function emailHospitalNewRequest_(r) {
  const link = ScriptApp.getService().getUrl() + '?id=' + encodeURIComponent(r.id) + '&t=' + encodeURIComponent(r.token);
  const ss = book_();
  MailApp.sendEmail({
    to: CONFIG.HOSPITAL_EMAIL,
    ...(r.email ? { replyTo: r.email } : {}),
    name: CONFIG.HOSPITAL_NAME + ' website',
    subject: `New appointment request: ${r.name}, ${r.department} (${r.id})`,
    htmlBody: mail_('New appointment request', `
      <p>A new request came in from the website. It is waiting for your approval.</p>
      ${table_([['Request', r.id], ['Name', r.name], ['Phone', r.phone], ['Email', r.email || '–'], ['Doctor', r.doctor || 'No preference'], ['Department', r.department],
        ['Preferred date', r.date ? prettyDate_(r.date) : 'Any day'], ['Preferred time', r.time ? timeLabel_(r.time) : 'Any time'], ['Message', r.message || '–']])}
      ${button_(link, 'Review and approve')}
      <p style="font-size:14px">The patient is also sending this request to WhatsApp ${CONFIG.WHATSAPP_NUMBER.replace(/^91/, '')}. <a href="${waUrl_(r.phone, 'Hello ' + r.name + ', this is ' + CONFIG.HOSPITAL_NAME + ' about your appointment request ' + r.id + '.')}">Open a WhatsApp chat with the patient</a>.</p>
      <p style="font-size:13px;color:#4F5B74">All requests are in the <a href="${ss.getUrl()}">Appointments sheet</a>
      (<a href="https://docs.google.com/spreadsheets/d/${ss.getId()}/export?format=xlsx">download as Excel</a>).</p>`)
  });
}

function emailPatientReceived_(r) {
  MailApp.sendEmail({
    to: r.email,
    replyTo: CONFIG.HOSPITAL_EMAIL,
    name: CONFIG.HOSPITAL_NAME,
    subject: `We have your appointment request (${r.id}), to be confirmed`,
    htmlBody: mail_(`Thank you, ${r.name}`, `
      <p>We have received your appointment request at ${CONFIG.HOSPITAL_NAME}. <strong>It is not confirmed yet.</strong>
      We will email you once the hospital confirms a date and time, or call you on ${esc_(r.phone)}.</p>
      ${table_([['Request', r.id], ['Department', r.department], ['Preferred date', r.date ? prettyDate_(r.date) : 'Any day'], ['Preferred time', r.time ? timeLabel_(r.time) : 'Any time']])}
      <p>OPD timings: ${CONFIG.OPD_HOURS}. To change or cancel, call reception on ${CONFIG.HOSPITAL_PHONE}.</p>
      ${emergencyNote_()}`)
  });
}

function emailPatientApproved_(r, date, time, doctor) {
  MailApp.sendEmail({
    to: r.email,
    replyTo: CONFIG.HOSPITAL_EMAIL,
    name: CONFIG.HOSPITAL_NAME,
    subject: `Appointment confirmed: ${date}${time ? ', ' + time : ''} (${r.id})`,
    htmlBody: mail_('Your appointment is confirmed', `
      <p>Dear ${esc_(r.name)}, your appointment at ${CONFIG.HOSPITAL_NAME} is confirmed.</p>
      ${table_([['Date', date], ['Time', time || 'Please come during OPD hours'], ...(doctor ? [['Doctor', doctor]] : []), ['Department', r.department], ['Request', r.id]])}
      <p><strong>Where:</strong> ${CONFIG.HOSPITAL_ADDRESS}</p>
      <p>Please bring an ID proof and any earlier reports, scans and prescriptions. To change or cancel, call ${CONFIG.HOSPITAL_PHONE}.</p>
      ${emergencyNote_()}`)
  });
}

function emailPatientDeclined_(r, reason) {
  MailApp.sendEmail({
    to: r.email,
    replyTo: CONFIG.HOSPITAL_EMAIL,
    name: CONFIG.HOSPITAL_NAME,
    subject: `About your appointment request (${r.id})`,
    htmlBody: mail_('We could not confirm this request', `
      <p>Dear ${esc_(r.name)}, we are not able to confirm your request as sent.${reason ? ' ' + esc_(reason) : ''}</p>
      <p>Please call reception on ${CONFIG.HOSPITAL_PHONE} and we will find a time that works.</p>
      ${emergencyNote_()}`)
  });
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
    description: `Request ${r.id}\nPhone: ${r.phone}${r.email ? '\nEmail: ' + r.email : ''}${r.message ? '\nNote: ' + r.message : ''}`
  });
  return ev.getId();
}

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
      const raw = sh.getRange(i + 1, COL['Preferred date']).getDisplayValue();
      return {
        row: i + 1,
        r: {
          id, status: v[COL['Status'] - 1], name: v[COL['Name'] - 1], phone: v[COL['Phone'] - 1], email: v[COL['Email'] - 1],
          department: v[COL['Department'] - 1], preferred: raw, preferredRaw: raw, preferredTime: v[COL['Preferred time'] - 1] || 'Any time', message: v[COL['Message'] - 1],
          decidedAt: v[COL['Decided at'] - 1], doctor: (v[COL['Doctor'] - 1] || '').replace('No preference', '')
        }
      };
    }
  }
  return null;
}

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

function emergencyNote_() {
  return `<p style="font-size:13px;color:#4F5B74">In an emergency, do not wait for email: call ${CONFIG.HOSPITAL_PHONE} (open 24 hours) or 108 for an ambulance.</p>`;
}
function table_(rows) {
  return '<table style="border-collapse:collapse;margin:16px 0;width:100%;max-width:520px">' + rows.map(([k, v]) =>
    `<tr><td style="padding:8px 12px 8px 0;color:#4F5B74;border-bottom:1px solid #DCE2EE;width:140px">${esc_(k)}</td><td style="padding:8px 0;border-bottom:1px solid #DCE2EE;color:#0B2A6F">${esc_(v)}</td></tr>`).join('') + '</table>';
}
function button_(href, label) {
  return `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;padding:14px 26px;border-radius:999px;background:#C8102E;color:#FFFFFF;font-weight:600;text-decoration:none">${esc_(label)}</a></p>`;
}
function mail_(title, body) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0B2A6F;max-width:600px">
    <p style="font-size:13px;color:#4F5B74;margin:0 0 4px">${CONFIG.HOSPITAL_NAME}, Tanuku</p>
    <h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 16px">${esc_(title)}</h1>
    ${body}
    <hr style="border:0;border-top:1px solid #DCE2EE;margin:24px 0">
    <p style="font-size:12px;color:#4F5B74">${CONFIG.HOSPITAL_NAME} · ${CONFIG.HOSPITAL_ADDRESS} · ${CONFIG.HOSPITAL_PHONE}</p></div>`;
}
function page_(title, body) {
  return HtmlService.createHtmlOutput(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#0B2A6F;background:#F2F5FA;margin:0;padding:24px}
    main{max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:28px;box-shadow:0 20px 50px -30px rgba(11,42,111,.4)}
    h1{font-family:Georgia,serif;font-weight:400;font-size:28px;margin:0 0 18px}
    dl{display:grid;grid-template-columns:130px 1fr;gap:8px 12px;margin:0 0 22px}dt{color:#4F5B74}dd{margin:0}
    form{display:grid;gap:12px;margin-top:16px}label{display:grid;gap:6px;font-weight:600;font-size:14px}
    input{font:inherit;padding:12px;border:1px solid #B9C4D8;border-radius:10px}
    button{font:inherit;font-weight:600;padding:14px;border-radius:999px;border:1px solid #0B2A6F;background:#fff;color:#0B2A6F;cursor:pointer}
    button.ok{background:#C8102E;border-color:#C8102E;color:#fff}.decline{padding-top:16px;border-top:1px solid #DCE2EE}
  </style><main><p style="margin:0 0 4px;color:#4F5B74;font-size:13px">${CONFIG.HOSPITAL_NAME}</p><h1>${esc_(title)}</h1>${body}</main>`)
    .setTitle(title + ' | ' + CONFIG.HOSPITAL_NAME);
}

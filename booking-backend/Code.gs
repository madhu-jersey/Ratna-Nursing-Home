/**
 * Ratna Nursing Home: appointment requests.
 *
 * Lives inside a Google Sheet (Extensions > Apps Script) and is deployed as a web app.
 *  1. The website posts a request here. It is saved as a row in the "Appointments" sheet.
 *  2. The hospital gets an email with the details and a "Review and approve" button.
 *     The patient gets an email saying the request is received and waiting for confirmation.
 *  3. The hospital opens the button's page, sets the date and time, and approves (or declines).
 *     The sheet row is updated and the patient gets the approval email.
 *
 * Setup steps are in booking-backend/SETUP.md.
 */

// Shown when the web app URL is opened in a browser, so you can see which code is live
const VERSION = 'Version 3: day and time required';

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

const HEADERS = ['Request ID', 'Received', 'Status', 'Name', 'Phone', 'Email', 'Department', 'Preferred date', 'Preferred time', 'Message',
  'Confirmed date', 'Confirmed time', 'Decided at', 'Source', 'Token'];
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
    date: /^\d{4}-\d{2}-\d{2}$/.test(p.date || '') ? p.date : '',
    time: slots_().indexOf(p.time) > -1 ? p.time : '',
    message: clean_(p.message, 1000),
    source: clean_(p.source, 30) || 'website'
  };
  const errors = [];
  if (req.name.length < 2) errors.push('name');
  if (!/^[+\d][\d\s-]{8,15}$/.test(req.phone)) errors.push('phone');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(req.email)) errors.push('email');
  if (!req.date || isSunday_(req.date)) errors.push('date');
  if (!req.time) errors.push('time');
  if (errors.length) return json_({ ok: false, errors, version: VERSION });

  req.id = 'RNH-' + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyMMdd') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  req.token = Utilities.getUuid();

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    sheet_().appendRow([req.id, new Date(), 'Pending', safe_(req.name), "'" + req.phone, safe_(req.email), req.department,
      "'" + (req.date ? prettyDate_(req.date) : 'Any day'), "'" + (req.time ? timeLabel_(req.time) : 'Any time'), safe_(req.message), '', '', '', req.source, req.token]);
  } finally {
    lock.releaseLock();
  }

  emailHospitalNewRequest_(req);
  emailPatientReceived_(req);
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
      const date = /^\d{4}-\d{2}-\d{2}$/.test(p.cdate || '') ? prettyDate_(p.cdate) : r.preferred;
      const time = clean_(p.ctime, 40);
      sh.getRange(row, COL['Status']).setValue('Approved');
      sh.getRange(row, COL['Confirmed date']).setValue("'" + date);
      sh.getRange(row, COL['Confirmed time']).setValue(safe_(time));
      sh.getRange(row, COL['Decided at']).setValue(decided);
      emailPatientApproved_(r, date, time);
      return page_('Approved', `<p>Request <strong>${esc_(r.id)}</strong> is approved for <strong>${esc_(date)}${time ? ', ' + esc_(time) : ''}</strong>.</p><p>${esc_(r.name)} has been emailed at ${esc_(r.email)}, and the sheet is updated.</p>`);
    }
    sh.getRange(row, COL['Status']).setValue('Declined');
    sh.getRange(row, COL['Decided at']).setValue(decided);
    emailPatientDeclined_(r, clean_(p.reason, 300));
    return page_('Declined', `<p>Request <strong>${esc_(r.id)}</strong> is declined. ${esc_(r.name)} has been emailed and asked to call reception.</p>`);
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
      <dt>Email</dt><dd>${esc_(r.email)}</dd>
      <dt>Department</dt><dd>${esc_(r.department)}</dd>
      <dt>Preferred date</dt><dd>${esc_(r.preferred)}</dd>
      <dt>Preferred time</dt><dd>${esc_(r.preferredTime)}</dd>
      <dt>Message</dt><dd>${esc_(r.message) || '&ndash;'}</dd>
    </dl>
    <form method="get" action="${url}" target="_top">
      <input type="hidden" name="id" value="${esc_(r.id)}"><input type="hidden" name="t" value="${esc_(p.t)}">
      <label>Appointment date<input type="date" name="cdate" value="${iso}" required></label>
      <label>Time<select name="ctime">${CONFIG.SESSIONS.map(sess => `<optgroup label="${sess[0]}">${slots_([sess]).map(t => `<option${timeLabel_(t) === r.preferredTime ? ' selected' : ''}>${timeLabel_(t)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <button name="do" value="approve" class="ok">Approve and email the patient</button>
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
    replyTo: r.email,
    name: CONFIG.HOSPITAL_NAME + ' website',
    subject: `New appointment request: ${r.name}, ${r.department} (${r.id})`,
    htmlBody: mail_('New appointment request', `
      <p>A new request came in from the website. It is waiting for your approval.</p>
      ${table_([['Request', r.id], ['Name', r.name], ['Phone', r.phone], ['Email', r.email], ['Department', r.department],
        ['Preferred date', r.date ? prettyDate_(r.date) : 'Any day'], ['Preferred time', r.time ? timeLabel_(r.time) : 'Any time'], ['Message', r.message || '–']])}
      ${button_(link, 'Review and approve')}
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

function emailPatientApproved_(r, date, time) {
  MailApp.sendEmail({
    to: r.email,
    replyTo: CONFIG.HOSPITAL_EMAIL,
    name: CONFIG.HOSPITAL_NAME,
    subject: `Appointment confirmed: ${date}${time ? ', ' + time : ''} (${r.id})`,
    htmlBody: mail_('Your appointment is confirmed', `
      <p>Dear ${esc_(r.name)}, your appointment at ${CONFIG.HOSPITAL_NAME} is confirmed.</p>
      ${table_([['Date', date], ['Time', time || 'Please come during OPD hours'], ['Department', r.department], ['Request', r.id]])}
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
          decidedAt: v[COL['Decided at'] - 1]
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

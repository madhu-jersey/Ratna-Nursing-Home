// Shared site data. Anything unconfirmed is `null` and renders as a labelled placeholder.

// The team's "to be confirmed" and "photo to be supplied" notes on the home page and footer.
// Off for the live site, so visitors see a finished page; set true to see every note while collecting details.
// Department pages always keep theirs: there each note qualifies a medical claim. PLACEHOLDERS.md lists everything.
export const SHOW_NOTES = false;

export const SITE = {
  name: 'Ratna Nursing Home',
  short: 'Ratna',
  descriptor: 'Nursing Home',
  abbr: 'RNH',
  tagline: 'General medicine, obstetrics, gynaecology and women\'s health, for Tanuku and the surrounding areas.',
  url: 'https://ratna-nursing-home.vercel.app', // the live address: canonical links, sitemap and social previews. Change it when a custom domain is added.
  state: 'Andhra Pradesh',
  town: 'Tanuku',
  region: 'West Godavari, Andhra Pradesh',
  established: null,   // TODO(client): year established
  registration: null,  // TODO(client): clinical establishment registration, shown in the footer
  googleListing: 'https://www.google.com/maps/place/Ratna+Nursing+Home/@16.7562839,81.6732954,1050m/data=!3m1!1e3!4m18!1m9!3m8!1s0x3a37b7ef5c469b97:0x5ef5c6882cadc0be!2sRatna+Nursing+Home!8m2!3d16.7562788!4d81.6758703!9m1!1b1!16s%2Fg%2F11dxlc85mm!3m7!1s0x3a37b7ef5c469b97:0x5ef5c6882cadc0be!8m2!3d16.7562788!4d81.6758703!9m1!1b1!16s%2Fg%2F11dxlc85mm',
  rating: 3.9,         // Google listing, as supplied by the client (October 2026)
  reviewCount: 55
};

export const BRANCHES = [
  {
    id: 'sajjapuram',
    name: 'Main hospital, Sajjapuram',
    primary: true,
    confirmed: true,
    addressLines: ['Peketi Vari Street, Near Railway Over Bridge', 'Sajjapuram', 'Tanuku 534211'],
    phone: '08819 222250',
    tel: '+918819222250',
    mobiles: [ // TODO(client): confirm whether either number is on WhatsApp
      { phone: '81798 98615', tel: '+918179898615' },
      { phone: '83098 55655', tel: '+918309855655' }
    ],
    email: null,
    days: 'Monday to Saturday', // OPD is closed on Sunday; casualty stays open
    hours: [['Morning', '10 am to 2 pm'], ['Evening', '5 pm to 8 pm']],
    geo: [16.7562788, 81.6758703],
    mapUrl: 'https://www.google.com/maps/place/Ratna+Nursing+Home/@16.7562839,81.6732954,1050m/data=!3m2!1e3!4b1!4m16!1m9!3m8!1s0x3a37b7ef5c469b97:0x5ef5c6882cadc0be!2sRatna+Nursing+Home!8m2!3d16.7562788!4d81.6758703!9m1!1b1!16s%2Fg%2F11dxlc85mm!3m5!1s0x3a37b7ef5c469b97:0x5ef5c6882cadc0be!8m2!3d16.7562788!4d81.6758703!16s%2Fg%2F11dxlc85mm',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=16.7562788%2C81.6758703'
  }
];

export const PRIMARY = BRANCHES.find(b => b.primary) || BRANCHES[0];

// Appointment requests go to the Google Apps Script in booking-backend/ (see SETUP.md).
// Paste the deployed web app URL here, then run npm run build. While it is null the form asks visitors to call.
export const BOOKING = {
  endpoint: 'https://script.google.com/macros/s/AKfycby5nvfryN77hhQnPOOInQ4dlVIn1rTB7vC11l4UZhE-xcr3PhbhdliDxU-tStmvDYMu/exec',
  popupScroll: 0.5, // the booking popup appears once per visit, after the visitor scrolls this many screens down...
  popupDelay: 1.5,  // ...and this many seconds have passed since (so it never interrupts a quick flick)
  // OPD sessions people can book into, Monday to Saturday, in 30-minute slots.
  // Keep in step with PRIMARY.hours above and SESSIONS in booking-backend/Code.gs.
  slotMinutes: 30,
  sessions: [['Morning', '10:00', '14:00'], ['Evening', '17:00', '20:00']]
};

// "10:00" -> "10:00 am"; the slots in one session, each the start of a 30-minute appointment
export const timeLabel = hhmm => { const [h, m] = hhmm.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
export const sessionSlots = ([, from, to]) => {
  const toMin = t => t.split(':').map(Number).reduce((h, m) => h * 60 + m);
  const out = [];
  for (let t = toMin(from); t + BOOKING.slotMinutes <= toMin(to); t += BOOKING.slotMinutes) out.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  return out;
};

export const EMERGENCY = {
  available24h: true, // confirmed by the client: emergency care 24 hours, every day
  phone: '08819 222250', tel: '+918819222250', // the reception line takes emergency calls round the clock
  ambulance: null,
  national: '108'
};

// `kind` picks the flat department mark (see serviceMarkSymbols in partials.mjs)
export const SERVICES = [
  { slug: 'general-medicine', name: 'General Medicine', kind: 'stethoscope', pcpndt: false, summary: 'Diabetes, thyroid, blood pressure, fever, breathing and kidney problems, and general consultations.' },
  { slug: 'obstetrics-gynaecology', name: 'Obstetrics & Gynaecology', kind: 'cradle', pcpndt: true, summary: 'Pregnancy care with electronic fetal monitoring, and women\'s health including PCOD.' },
  { slug: 'ultrasound', name: 'Ultrasound Scanning', kind: 'scan', pcpndt: true, summary: 'Pregnancy, abdominal and pelvic scans, read by the doctor treating you.' },
  { slug: 'infertility', name: 'Infertility Treatment', kind: 'cell', pcpndt: true, summary: 'Tests and treatment for couples who are finding it hard to conceive.' },
  { slug: 'laparoscopic-surgery', name: 'Laparoscopic Surgery', kind: 'scope', pcpndt: false, summary: 'Keyhole operations through small cuts, for a shorter stay and quicker recovery.' }
];

// Areas of care shown on each doctor's card, taken from their department's scope.
// TODO(client): each doctor can confirm or narrow their own list.
const AREAS = {
  medicine: ['Diabetes, thyroid and blood pressure', 'Fever, infections, breathing and kidney problems'],
  women: ['Pregnancy care, normal and caesarean delivery', 'Periods, PCOD and other women\'s health problems']
};

export const DOCTORS = [
  { branch: 'sajjapuram', name: 'Dr. Valluri Soma Sekhar', qualification: 'M.B.B.S., D.C.H., M.D. (General Medicine)', specialty: 'General Medicine', regNo: '16999', bio: null, areas: AREAS.medicine },
  { branch: 'sajjapuram', name: 'Dr. Valluri Subba Lakshmi', qualification: 'M.B.B.S., D.G.O.', specialty: 'Obstetrics & Gynaecology', regNo: '18120', bio: null, areas: AREAS.women },
  { branch: 'sajjapuram', name: 'Dr. Valluri Amrutha Ratna', qualification: 'M.B.B.S., M.S. (OB-GYN), Gold Medal', specialty: 'Obstetrics & Gynaecology', regNo: '85666', bio: null, areas: AREAS.women },
  { branch: 'sajjapuram', name: 'Dr. Bikkina Ghana Syam', qualification: 'M.B.B.S., M.D. (General Medicine)', specialty: 'General Medicine', regNo: '78473', bio: null, areas: AREAS.medicine }
];

// From the brochure; every item still needs the hospital to verify it before publishing
export const FACILITIES = {
  verified: false,
  items: ['Outpatient services', 'Inpatient care', 'General ward', 'Post-operative care', 'Oxygen support', 'Pharmacy', 'ECG', 'Ultrasound', 'Electronic fetal monitoring']
};

export const LEGAL = {
  // TODO(client): replace with the exact wording on the hospital's notice board
  pcpndt: 'Disclosure of the sex of the foetus is prohibited under the PC & PNDT Act, 1994. Sex determination is not done at this hospital.',
  pcpndtConfirmed: false
};

// Google reviews chosen by the client, copied word for word from the listing (all 5 stars).
// Satya Perikala's review is cut short on Google's card; only the visible text is used.
export const REVIEWS = [
  { name: 'divya tirunadham', text: 'My delivery experience at Ratna Nursing Home, Tanuku was truly unforgettable.\nDr. Amrutha Ratna madam treated me with so much care, patience, and love — like a family member. Throughout my pregnancy and during my C-section delivery, she made me feel calm, confident, and completely safe.\nThe staff were also very attentive and helpful.\n\nI\u2019m truly thankful to Dr. Amrutha Ratna and Dr.Subba lakshmi  madam and her team.' },
  { name: 'Sindhuja Karri', text: 'I have visited ratna nursing home at the end of my pregnancy at 38 weeks with mild high resistance flow in both uterine arteries,when other doctors suggested c section , Amrutha mam handled the case with patience and explained every possibility that could be tried for having normal delivery .Also assured about the safety of both mother and baby.Finally had a smooth normal delivery with the help of both Subbalakshmi mam and Amrutha mam.' },
  { name: 'Divya Javvadi', text: 'Both subbalakshmi mam and ratna mam are very polite and friendly with patients. The way they treated me was the reason to write this review. After my delivery, I got infected after 2 days. The way the doctor treated was excellent, She just treated me as a person in her home. Staff are very polite and responded quickly during emergency times.' },
  { name: 'Satya Perikala', text: 'The staff were caring and professional, and the Dr.Amrutha madam took time to explain everything clearly. I was very impressed with the efficiency and quality of care from start to finish. Thank you so much madam for give a good treatment \u{1F64F}' },
  { name: 'Sardhar Nani', text: 'Dr. Ghanashyam sir and  Dr. Amrutharatna madam very polite and friendly with patients. The doctors Treated was excellent.  Staff are very responsibility.' },
  { name: 'kalyani paricherla', text: 'They Will treat patients very well and maintaining with good staff, very good hospitality' }
];

// The services section: three groups, each a ticked list. `slug` links an item to its department page.
export const SERVICE_GROUPS = [
  { title: 'Medical and surgical care', mark: 'stethoscope', items: [
    { text: 'General medicine', slug: 'general-medicine' },
    { text: 'Diabetes, thyroid and blood pressure care' },
    { text: 'Fever, infections and breathing problems' },
    { text: 'Kidney problems' },
    { text: 'Laparoscopic (keyhole) surgery', slug: 'laparoscopic-surgery' },
    { text: '24-hour emergency care' }
  ] },
  { title: 'Women\'s and pregnancy care', mark: 'cradle', items: [
    { text: 'Obstetrics and gynaecology', slug: 'obstetrics-gynaecology' },
    { text: 'Pregnancy check-ups (antenatal care)' },
    { text: 'Ultrasound scanning', slug: 'ultrasound' },
    { text: 'Electronic fetal monitoring' },
    { text: 'Normal and caesarean delivery' },
    { text: 'PCOD and period problems' },
    { text: 'Infertility treatment', slug: 'infertility' }
  ] },
  { title: 'Facilities and support', mark: 'cross', facilities: true, items: ['Outpatient services', 'Inpatient care', 'General ward', 'Post-operative care', 'Oxygen support', 'Pharmacy', 'ECG'].map(text => ({ text })) }
];

// "Why choose": four short reasons, each drawn from facts stated elsewhere on the site
export const WHY = [
  { icon: 'i-ambulance', title: '24-hour emergency care', text: 'The emergency department is open day and night, every day of the year, including Sundays.' },
  { icon: 'i-users', title: 'Experienced specialists', text: 'Two general physicians and two gynaecologists, including a gold-medal OB-GYN surgeon, see every patient in person.' },
  { icon: 'p-pregnant', title: 'Mother and baby care', text: 'Pregnancy check-ups, scans, fetal monitoring and delivery, all at one hospital close to home.' },
  { icon: 'p-monitor', title: 'Scans and tests on site', text: 'Ultrasound, ECG and a pharmacy in the same building, so your doctor sees results sooner.' }
];

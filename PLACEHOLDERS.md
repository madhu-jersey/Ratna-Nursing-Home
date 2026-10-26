# Placeholders needing hospital input

Each item below shows on the site as a pale blue-grey "to be confirmed" chip, a dashed frame, or a muted "to be confirmed" line. Fill them in `HOSPITAL-DETAILS.md` and ask Claude to apply it, or edit `build/data.mjs` (site-wide facts) and `build/services-content.mjs` (department text) yourself, then run `npm run build`.

## Verify before publishing
- [ ] **Facilities list** (outpatient services, inpatient care, general ward, post-operative care, oxygen support, pharmacy, ECG, ultrasound, electronic fetal monitoring). These come from the brochure, so check each one with the hospital.
- [ ] **PC-PNDT notice.** The site shows a standard statement in the footer and on the Obstetrics, Ultrasound and Infertility pages. Replace it with the exact wording on the hospital's notice board, then set `LEGAL.pcpndtConfirmed: true`.
- [ ] Whether **81798 98615** or **83098 55655** is on WhatsApp.
- [x] Logo in the header, hero and footer (assets/img/logo.png, cut out from the supplied PNG).

## Hero
- [ ] The approved hero (top banner) design or text. The current one is a labelled stand-in.

## Brand
- [ ] Logo as SVG (sharper than the PNG now used)
- [x] Brand colours: Navy `#16324B` and Butter `#F3EDDD` (supplied palette).
- [ ] "Designed by" footer credit
- [ ] Facebook, Instagram and YouTube links
- [ ] Clinical establishment registration text for the footer (optional)

## Location
- [x] OPD timings: morning 10 am to 2 pm, evening 5 pm to 8 pm.
- [x] OPD days: Monday to Saturday (closed Sunday).
- [x] Google Maps link (for "Get directions" and "Open in Google Maps"). Directions use the pin at 16.7562788, 81.6758703.
- [ ] Email (optional)
- [x] Embedded Google map on the home page (loads from Google when the visitor reaches Find us).

## Emergency
- [x] Casualty is open 24 hours, every day.
- [x] Emergency number: the reception line, 08819 222250, answered 24 hours.
- [ ] Ambulance number, if the hospital has its own

## About
- [ ] Years of service (or the year established)
- [ ] Number of beds
- [ ] Patients treated
  Once a number is confirmed, set `value` and `confirmed: true` in `SITE.stats` and its counter will animate.
- [ ] Hospital photo (suggested: the front of the hospital in daylight)

## Doctors
- [ ] A short bio for each of the four doctors (training, experience, languages spoken)
- [ ] A portrait photo for each doctor

## Gallery
- [ ] Photos for the nine labelled frames: hospital entrance, general ward, ultrasound room, reception, doctors and nursing team, waiting area, fetal monitoring, pharmacy, patient room
- [ ] Permission from any staff or patients who appear in photos. Never show patients' faces without written consent.

## Google reviews
- [x] Google listing URL
- [x] Rating and review count: 3.9 from 55 reviews (October 2026). Update `SITE.rating` and `SITE.reviewCount` in `build/data.mjs` as they change.
- [x] Six reviews chosen by the client, copied word for word with names as on Google (`REVIEWS` in `build/data.mjs`). Satya Perikala's review is cut short on Google; only the visible text is used.
- [ ] Confirm the hospital is happy to quote these reviewers by name on its website.

## Contact form
- [x] Deploy the booking script and paste its URL into `BOOKING.endpoint` (steps in [booking-backend/SETUP.md](booking-backend/SETUP.md)). Until then the form asks visitors to call reception.
- [ ] Change `HOSPITAL_EMAIL` in `booking-backend/Code.gs` from the testing address (madhujersey9999@gmail.com) to the hospital's own before going live.
- [ ] Who calls back, and how soon
- [ ] Privacy notice wording for collecting names and phone numbers

## FAQ (landing page)
- [x] OPD timings
- [ ] Call-back times
- [ ] First visit and what to bring (drafts written; the hospital needs to confirm them)
- [ ] Payment methods; insurance, cashless and government schemes (Aarogyasri, Ayushman Bharat)
- [x] Casualty hours and emergency number
- [ ] Visiting hours and number of attendants allowed

## Department pages (all five)
Every page is labelled "Draft, pending doctor review". A doctor from the department needs to read and correct each page in full. Specific gaps:

**General Medicine:** tests done on site; ward facilities; fasting instructions; recommended BP check interval; casualty hours.

**Obstetrics & Gynaecology:** delivery facilities (labour room, caesarean, NICU) and stay length; gynaecological procedures offered; usual scan schedule; normal delivery after caesarean; labour and emergency cover outside OPD hours; usual duration of fetal monitoring.

**Ultrasound Scanning:** preparation instructions (full bladder, fasting); whether a referral is needed.

**Infertility Treatment:** whether IUI and IVF are offered; laparoscopy for fertility; typical treatment timeline.

**Laparoscopic Surgery:** which procedures are offered (cystectomy, hysterectomy, myomectomy, gall bladder, appendix, hernia); anaesthesia; hospital stay for each.

## Content rules followed
- No "best", "No.1", "painless" or guarantee claims anywhere. The only round-the-clock claim is the 24-hour emergency department, confirmed by the hospital.
- No stock photos, emojis or clip-art. Every image slot is a labelled frame.
- No invented reviews. Only real Google reviews supplied by the client are shown, word for word (one includes the reviewer's own emoji).
- Every page that mentions emergencies tells the visitor to call 108 or go to the nearest emergency department for life-threatening signs.
- No mention of foetal sex determination except the PC-PNDT prohibition.

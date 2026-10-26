# MASTER PROMPT: rebuild this clinic website for a new clinic

Paste everything below the line into a new Claude Code session, together with a filled-in `client.config.json` (section B). The session needs no other context.

---

You're rebuilding a finished clinic website for a new clinic. The source site is the **Sree Mithra Dental & Maxface Specialists** site (the "source"). You'll produce a new site with the same design, layout, motion, interactions and accessibility. Only the name, colours, content, contact details, reviews and assets change. These come from `client.config.json`.

**Where the source is.** If the source folder is available (default `SOURCE_DIR = ../MAX-DENTAL`, which contains `build/`, `assets/`, `ANALYSIS.md`), copy it and work on the copy. Read `ANALYSIS.md` first. If it isn't available, build from the specification in the appendices, which describe the source exactly. In both cases the appendices are the reference for "the same".

## A. Purpose and rules

1. Rebuild the same design, layout, motion and features for the new clinic.
2. Keep the structure, section order, motion values, interactions and accessibility identical. Change one only when a config field explicitly says otherwise (for example `booking.enabled: true`, or a branch count other than 2).
3. Use only the new clinic's own name, logo, photos, reviews and contact data. Never reuse another clinic's logo, name or trademark. That includes the source clinic: no source text, number, address, doctor or review may remain anywhere.
4. Never invent reviews, ratings, review counts, doctor names, credentials or bios, photos, statistics or medical claims. If a value is unknown or `null` in the config, render the source's labelled placeholder (a pink "to be confirmed" chip, a dashed frame, or a muted "{Field} to be confirmed" line) and list it in the report.
5. No marketing claims such as "No.1", "best", "24x7", "painless" or awards, unless the config supplies them with `"confirmed": true`.
6. No stock photos, emojis or clip-art. An image slot without a supplied file stays a labelled placeholder.
7. All medical text on service pages keeps the label "Draft, pending doctor review" until `services[].medicalReviewed` is `true`.
8. Don't add features that the source doesn't have (mascot, particles, rating breakdown tooltip, extra sections) unless a config field turns on a module described in Appendix 4.
9. Animate only `transform` and `opacity`. The source has four paint-only colour transitions (buttons, FAQ disc, problem card border and icon tile, service card border). Keep them as they are; don't add new ones.
10. Every real value must come from the config. Don't type clinic facts into components.

## B. Variables form: `client.config.json`

Create this file at the root of the new site. The example below holds the **source clinic's real values**, so that a default is always available. **Every value marked ★ in the table is brand-specific and must be replaced.** Values left at the source default fail the acceptance check.

```json
{
  "clinic": {
    "name": "Sree Mithra Dental & Maxface Specialists",
    "short": "Sree Mithra",
    "descriptor": "Dental & Maxface Specialists",
    "nameLocal": null,
    "nameLocalLang": null,
    "tagline": "Specialist care for teeth, jaw and face, under one roof.",
    "region": "West Godavari",
    "slug": "sree-mithra-dental",
    "locale": "en-IN"
  },
  "palette": {
    "ink": "#14171C",
    "graphite": "#1F2329",
    "steel": "#2E343D",
    "pearl": "#F5F6F8",
    "mist": "#E9ECF1",
    "silver": "#B8BFC9",
    "slate": "#5A6270",
    "accent": "#C8102E",
    "accentHover": "#9E0B24",
    "blush": "#FBE9EC",
    "gold": "#D4A437",
    "white": "#FFFFFF"
  },
  "fonts": {
    "serif": "Cormorant Garamond",
    "serifWeights": [500, 600],
    "sans": "Hanken Grotesk",
    "sansWeights": [400, 500, 600]
  },
  "logo": {
    "file": null,
    "fileOnDark": null,
    "alt": "Sree Mithra Dental & Maxface Specialists",
    "headerHeightPx": 36,
    "footerHeightPx": 56,
    "clearSpace": "0.5 × logo height on every side",
    "favicon": null
  },
  "illustration": {
    "type": "silver-3d-accents",
    "note": "Source has no mascot. Keep the five silver service marks and 3D accents, recoloured by palette.accent. Set type to 'none' to use only the SVG marks."
  },
  "hero": {
    "provided": false,
    "html": null,
    "h1": "Sree Mithra Dental & Maxface Specialists",
    "sub": "Specialist care for teeth, jaw and face, under one roof."
  },
  "copy": {
    "services":  { "eyebrow": "What we treat", "title": "Five specialities, one team", "intro": "From a routine filling to jaw surgery, your care stays with the same clinic and the same records.", "swipeHint": "Swipe to see all five" },
    "about":     { "title": "Teeth, jaw and face, treated as one", "paragraphs": [
      "A toothache, a fractured jaw and a smile you want to change all start in the same place. Our dentists and an oral and maxillofacial surgeon work side by side, so you are seen by the right specialist without being sent elsewhere.",
      "We explain what we find, show you the options, and agree a plan before treatment begins. Your X-rays, notes and follow-ups stay together at one clinic, across both branches."],
      "photoCaption": "Suggested: the Tanuku treatment room in daylight" },
    "doctors":   { "eyebrow": "Consultants and doctors", "title": "The people you will see", "intro": "Each branch has its own team. Choose a doctor here and we will add their name to your appointment request." },
    "branches":  { "eyebrow": "Branches", "title": "Two clinics in West Godavari", "intro": "Visit whichever is closer. Your records can be shared between branches." },
    "gallery":   { "eyebrow": "Gallery", "title": "Inside the clinic", "intro": "Photos of both branches will appear here. Each frame below is labelled with the shot we need." },
    "reviews":   { "eyebrow": "Google reviews", "title": "What patients say", "intro": "Selected reviews from the clinic's Google listing will appear here, with the reviewer's name as shown on Google." },
    "contact":   { "eyebrow": "Contact", "title": "Request an appointment", "intro": "Tell us what you need and when suits you. For anything urgent, call the branch directly.", "messagePlaceholder": "For example: pain in a lower back tooth for three days", "note": "We will call to confirm a time. Requests are not appointments until confirmed." },
    "faq":       { "eyebrow": "FAQ", "title": "Before you visit", "intro": "Answers marked \"to be confirmed\" are waiting on details from the clinic." },
    "meta":      { "landingTitle": "Sree Mithra Dental & Maxface Specialists | Tanuku and Tadepalligudem", "landingDescription": "Dental, cosmetic, implant, facial trauma and maxillofacial care at Sree Mithra Dental & Maxface Specialists, Tanuku and Tadepalligudem.", "serviceDescriptionSuffix": "Tanuku and Tadepalligudem." }
  },
  "stats": [
    { "label": "Years of practice", "value": null, "suffix": "+", "confirmed": false },
    { "label": "Patients treated", "value": null, "suffix": "+", "confirmed": false },
    { "label": "Procedures performed", "value": null, "suffix": "+", "confirmed": false }
  ],
  "branches": [
    {
      "id": "tanuku", "name": "Tanuku", "primary": true, "confirmed": true,
      "addressLines": ["Sree Satya Plaza, Velpur Rd", "Opposite Masjid Complex, Venkatarayapuram", "Tanuku 534211"],
      "phone": "088192 20055", "tel": "+918819220055",
      "email": null, "whatsapp": null,
      "hours": [["Mon to Sat", "9 am to 8 pm"], ["Sunday", "9 am to 5 pm"]],
      "mapUrl": "https://www.google.com/maps/dir/?api=1&destination=Sree%20Satya%20Plaza%2C%20Velpur%20Rd%2C%20Venkatarayapuram%2C%20Tanuku%20534211",
      "mapImage": null
    },
    {
      "id": "tadepalligudem", "name": "Tadepalligudem", "primary": false, "confirmed": false,
      "addressLines": null, "phone": null, "tel": null, "email": null, "whatsapp": null,
      "hours": null, "mapUrl": null, "mapImage": null
    }
  ],
  "services": [
    { "slug": "dental", "name": "Dental", "kind": "crown", "summary": "Check-ups, fillings, root canals and extractions for teeth and gums.", "medicalReviewed": false },
    { "slug": "cosmetology", "name": "Cosmetology", "kind": "veneer", "summary": "Whitening, veneers and smile design for colour, shape and spacing.", "medicalReviewed": false },
    { "slug": "implants", "name": "Implants", "kind": "implant", "summary": "Fixed replacements for missing teeth, anchored in the jaw.", "medicalReviewed": false },
    { "slug": "facial-trauma", "name": "Facial Trauma", "kind": "face", "summary": "Assessment and repair of injuries to the face, jaw and teeth.", "medicalReviewed": false },
    { "slug": "maxillofacial", "name": "Maxillofacial", "kind": "jaw", "summary": "Surgery for the jaws, jaw joints and soft tissues of the mouth.", "medicalReviewed": false }
  ],
  "serviceContentFile": "build/services-content.mjs",
  "doctors": [
    { "id": "dr-subbareddy", "branch": "tanuku", "name": "Dr. G. Sriramu Subbareddy", "nameNote": "Name and spelling to be confirmed. The clinic board also shows \"Dr. S.R.S. Reddy\".", "qualification": "M.D.S (OMFS)", "specialty": "Oral and maxillofacial surgery", "specialtyConfirmed": true, "photo": null, "bio": null, "email": null },
    { "id": "dr-lakshmi", "branch": "tanuku", "name": "Dr. G.V.N. Lakshmi", "qualification": "B.D.S", "specialty": "General dentistry", "specialtyConfirmed": false, "photo": null, "bio": null, "email": null },
    { "id": null, "branch": "tadepalligudem", "name": null, "qualification": null, "specialty": null, "photo": null, "bio": null },
    { "id": null, "branch": "tadepalligudem", "name": null, "qualification": null, "specialty": null, "photo": null, "bio": null }
  ],
  "google": {
    "listingUrl": "https://www.google.com/maps/search/?api=1&query=Sree%20Mithra%20Dental%20Tanuku",
    "listingConfirmed": false,
    "rating": null,
    "reviewCount": null,
    "breakdown": null
  },
  "reviews": [],
  "reviewPlaceholderCount": 6,
  "faq": [
    { "q": "How do I book an appointment?", "a": "Call the {primaryBranch} branch on {primaryPhone}, or send a request with the form above and we will call you back to confirm a time.", "tbc": ["Tadepalligudem number and call-back times to be confirmed"] },
    { "q": "What happens at my first visit?", "a": "The doctor asks about your concern and your medical history, examines your teeth, gums and jaw, and may take X-rays. You will hear what we found and the options before any treatment begins.", "tbc": ["Draft, to be confirmed by the clinic"] },
    { "q": "What should I bring?", "a": "Any earlier X-rays or dental reports, a list of medicines you take, and a referral letter if a doctor sent you.", "tbc": ["Draft, to be confirmed by the clinic"] },
    { "q": "How can I pay?", "a": null, "tbc": ["Accepted payment methods to be confirmed with client", "Insurance and instalment options to be confirmed with client"] },
    { "q": "What should I do in a dental or facial emergency?", "a": "For a knocked-out tooth, an injured jaw or fast-spreading swelling, call the clinic straight away. If someone has a head injury, has lost consciousness, has trouble breathing or is bleeding heavily, go to the nearest hospital emergency department first.", "tbc": ["Emergency availability outside clinic hours to be confirmed"] },
    { "q": "Do I need a referral to see the maxillofacial surgeon?", "a": null, "tbc": ["To be confirmed with client"] },
    { "q": "Which branch should I visit?", "a": "Either.", "tbc": ["Services offered at each branch to be confirmed with client"] }
  ],
  "gallery": {
    "categories": [["all", "All"], ["clinic", "Clinic"], ["equipment", "Equipment"], ["team", "Team"]],
    "items": [
      { "label": "Reception", "cat": "clinic", "ratio": "tall", "file": null, "alt": null },
      { "label": "Treatment room", "cat": "clinic", "ratio": "wide", "file": null, "alt": null },
      { "label": "Dental chair", "cat": "equipment", "ratio": "sq", "file": null, "alt": null },
      { "label": "Sterilisation area", "cat": "equipment", "ratio": "tall", "file": null, "alt": null },
      { "label": "Doctors at work", "cat": "team", "ratio": "wide", "file": null, "alt": null },
      { "label": "Waiting area", "cat": "clinic", "ratio": "pano", "file": null, "alt": null },
      { "label": "Digital X-ray unit", "cat": "equipment", "ratio": "wide", "file": null, "alt": null },
      { "label": "Front desk team", "cat": "team", "ratio": "tall", "file": null, "alt": null },
      { "label": "Clinic entrance", "cat": "clinic", "ratio": "sq", "file": null, "alt": null }
    ]
  },
  "aboutPhoto": { "file": null, "alt": null },
  "social": { "instagram": null, "facebook": null, "youtube": null },
  "footer": { "credit": null, "legalLinks": [] },
  "booking": {
    "enabled": false,
    "notConnectedMessage": "Online booking is not connected yet, so this request has not been sent. To book now, call the {primaryBranch} branch on {primaryPhone}.",
    "provider": "apps-script",
    "endpoint": null,
    "sheetId": null,
    "adminEmail": null,
    "doctorRouting": {},
    "slotPeriods": [
      { "id": "morning", "label": "Morning", "start": "09:00", "end": "13:00" },
      { "id": "afternoon", "label": "Afternoon", "start": "13:00", "end": "17:00" },
      { "id": "evening", "label": "Evening", "start": "17:00", "end": "20:00" }
    ],
    "windowDays": 30,
    "pendingExpiryHours": 24,
    "sunday": { "open": true, "periods": ["morning", "afternoon"] },
    "capacityPerPeriod": null
  }
}
```

### Field table

★ = brand-specific; the source value must not survive. ○ = keep the source default unless the client wants a change.

| Field | ★/○ | Rule |
|---|---|---|
| `clinic.name`, `short`, `descriptor` | ★ | Header shows `short` with `descriptor` in small text. Titles, meta, footer and aria-labels use `name`. |
| `clinic.nameLocal`, `nameLocalLang` | ★ | Optional (for example a Telugu name with `"te"`). The source has none. If set, render it under the footer tagline as `<span lang="{nameLocalLang}">`. Nowhere else. |
| `clinic.tagline` | ★ | Hero stand-in sub and footer |
| `clinic.region` | ★ | Used only in the copy that mentions it |
| `clinic.locale` | ○ | Counter number formatting |
| `palette.*` | ★ | See the palette mapping below. Every text and button pair must meet WCAG AA (Appendix 6). |
| `fonts.*` | ○ | Maximum two families: one serif for headings, one sans for body. |
| `logo.*` | ★ | SVG preferred. Header 36px tall, footer 56px tall, clear space 0.5 × height. Alt text = clinic name. `null` → the source's dashed placeholders. |
| `logo.favicon` | ★ | The source has none. If supplied, add `<link rel="icon">` (SVG plus 32px PNG). |
| `illustration.type` | ○ | `silver-3d-accents` (source) or `none`. There's no mascot option because the source has none. |
| `hero.*` | ★ | `provided: false` → the labelled stand-in hero. `provided: true` → paste `hero.html` unchanged and make sure it contains the page's only H1. |
| `copy.*` | ★ | All section headings and intros. Same lengths as the source, ±20%. |
| `stats[]` | ★ | Real figures only. A counter animates only when `confirmed: true`. |
| `branches[]` | ★ | One or two entries (the source layout is two). Exactly one `primary: true`; it drives "Call {name}", the call bar and the form fallback message. |
| `branches[].email`, `whatsapp` | ★ | The source has none. If set, add them as extra rows in `info-list` (mail and chat icons in the same stroke style) and in the footer branch block. |
| `services[]` | ★/○ | The source has five, and the tray layout (3 top, 2 bottom) assumes five. `kind` must be one of `crown`, `veneer`, `implant`, `face`, `jaw`. |
| `serviceContentFile` | ★ | Same shape as the source `CONTENT`: `lead`, `problems[{icon,title,notice,why}]`, `causes[]`, `treatments[{name,involves,recovery,tbc?}]`, `expect[3]`, `faq[[q,a]]`, optional `emergency{title,steps[],note}`. `[text]` renders as a placeholder chip. |
| `doctors[]` | ★ | Real people only. `null` name → the source's dashed placeholder card. |
| `google.*` | ★ | Real figures only. `breakdown` stays unrendered because the source has no breakdown UI. |
| `reviews[]` | ★ | `{author, text, date, rating, url}`, copied word for word from Google with permission. Empty → `reviewPlaceholderCount` placeholder cards, each marked "Placeholder, not a real review". |
| `faq[]` | ★ | `{primaryBranch}` and `{primaryPhone}` are filled from the primary branch. Each `tbc` entry renders as a chip. `a: null` → chips only. |
| `gallery.*` | ★ | `ratio` is one of `tall` 3:4, `wide` 4:3, `sq` 1:1, `pano` 16:10. A file without alt text is an error. |
| `social.*` | ★ | `null` → the source's dashed "{Network}, to be confirmed" chips. |
| `footer.credit`, `legalLinks` | ★ | `null` credit → "[studio credit, to be confirmed]" |
| `booking.*` | ★ | `enabled: false` (source behaviour): validate, then show `notConnectedMessage`. `true` → build Appendix 4. |

### Palette mapping

The source palette uses role names. If a brief names colours differently, map them like this:

| Brief name | Config key | Source value | Used for |
|---|---|---|---|
| Heading colour | `ink` | `#14171C` | Light-theme text; dark section, header and footer bg |
| (dark surface) | `graphite` | `#1F2329` | Cards on dark; Branches and Talk bg |
| (dark line) | `steel` | `#2E343D` | Lines on dark |
| Off-white | `pearl` | `#F5F6F8` | Page bg, text on dark |
| (alt light bg) | `mist` | `#E9ECF1` | Alternating light sections, placeholders |
| (muted on dark) | `silver` | `#B8BFC9` | Muted text on dark |
| Body grey | `slate` | `#5A6270` | Muted text on light |
| Crimson / button red | `accent` | `#C8102E` | Buttons, active states, highlights, rim light. Never body text. |
| Maroon | `accentHover` | `#9E0B24` | Button hover |
| Blush / soft pink | `blush` | `#FBE9EC` | Placeholder chips, draft banner, selection, error fields |
| Gold | `gold` | `#D4A437` | Review stars only |
| White | `white` | `#FFFFFF` | Light surfaces, button text |
| Accent yellow | (none) | – | The source has no yellow. Don't add one. |

Target usage stays at about 60% light, 25% dark, 10% silver and 5% accent.

## C. Build steps, in order

### Step 0. Set up and make the source config-driven
1. Create the output folder `../{clinic.slug}/` and copy the source into it (or scaffold the same file layout from Appendix 1).
2. Add `client.config.json` and a loader (`build/config.mjs`) that reads it and exports `SITE`, `BRANCHES`, `SERVICES`, `DOCTORS`, `COPY`, `FAQ`, `GALLERY`, `REVIEWS`, `BOOKING`, `PALETTE`.
3. Replace every hard-coded brand value in the source with config reads. The known list:
   - `partials.mjs`: header wordmark ("Sree Mithra" / "Dental & Maxface Specialists"); "Call Tanuku"; call bar "Call now: Tanuku …"; footer socials and credit; `theme-color` meta; the Google Fonts URL; the `#g-silver`/`#g-rim` gradient colours and map pin colour (derive from palette); `BRANCHES[0]` → primary branch.
   - `landing.mjs`: `<title>` and meta; every section eyebrow, title and intro; about paragraphs and caption; the `GALLERY` array; review placeholder texts; form placeholder and note; the `FAQ` array; "Swipe to see all five".
   - `service-template.mjs`: meta suffix; "Call Tanuku"; the draft banner wording ("the clinic's dentists" → "the clinic's doctors" if the new clinic isn't dental).
   - `site.js`: the form status message (line 316) must come from `booking.notConnectedMessage` (pass it via a `data-` attribute on the form); counter locale.
   - `site.css`: generate a `:root` block from `palette` (Appendix 2 lists the derived colours).
   - `accent3d.js`: `0xC8102E` (rim lights and red panels) → `palette.accent`, passed in via `data-accent` on `.accent`.
4. Run the build and confirm that the output is byte-identical in structure to the source before any value changes. Diff the tag structure, ignoring text.

### Step 1. Colours
Write the new `palette` into the generated `:root` block and recompute the derived colours (Appendix 2). Run the contrast script (Appendix 6) for every pair. If a pair fails, adjust only the lightness of the failing token, re-run, and report the change. Never put `accent` on body text.

### Step 2. Logo and brand images
Replace the header `.brand-mark` and footer `.logo-ph` with `<img src alt="{clinic.name}" height="36|56">` when the logo is supplied (`fileOnDark` in the dark header and footer). Add the favicon if supplied. Keep the alt-text pattern: decorative SVG gets `aria-hidden`; real photos get descriptive alt text from the config; placeholders stay labelled frames. Photos get `loading="lazy" decoding="async"` with `width` and `height`. The about photo keeps its parallax inner layer: put the `<img>` inside `.ph-inner`.

### Step 3. Content
Fill everything from the config. **Don't change layout to fit longer text.** If a value is more than 20% longer than the source equivalent, shorten it (keeping the meaning) or use a placeholder, and list it in the report. Service pages come from `serviceContentFile`. If the new clinic isn't dental, its doctors must write or approve that content; until then, keep the source structure with `[to be confirmed]` chips and the draft label.

### Step 4. Sections, order and motion
Rebuild the sections in exactly the order in Appendix 1, with the motion values in Appendix 3. Don't add, remove or reorder sections. Don't change timings or easing.

### Step 5. Booking backend (only if `booking.enabled` is true)
The source has **no backend**. If `enabled` is `false`, skip to step 6 and keep the source behaviour. If `true`, build the module in Appendix 4 for this clinic only: a new Google Sheet, a new Apps Script project bound to it, its own `CONFIG` from `booking.*`, and its own admin email. **Never point it at another clinic's sheet or script.** Put the deployed URL in `booking.endpoint`.

### Step 6. Connect and test the form
- `enabled: false`: an empty submit shows four errors and focuses Name; an invalid phone shows "Enter a 10-digit mobile number."; a valid submit shows the not-connected message with the new primary branch and phone, and nothing is sent.
- `enabled: true`: test every state in Appendix 4 (valid booking, slot taken, Sunday evening, date outside the window, network failure, honeypot filled) and record the result of each.

### Step 7. Animation and effects checklist
At 360, 390, 768, 1024, 1280 and 1440px, on the landing page and one service page:
- Reveals and staggers fire once; the tray tilts and glows (desktop) or swipes (mobile).
- Magnetic buttons move; parallax moves only `transform`.
- Carousel: next/previous, drag with momentum, auto-advance every 6s, pause on hover and focus, pause button works.
- Lightbox: fade and scale in; ←, →, Esc; swipe; focus trap and focus return.
- FAQ opens with `aria-expanded`; the 3D accent loads, settles, follows the pointer and stops when off screen.
- The card-to-header morph works in Chromium.
- No horizontal scroll at any width.

Then repeat with `prefers-reduced-motion: reduce`: content must appear immediately, with no reveals, parallax, tilt, magnetic pull, auto-advance or morph, and the 3D accent as a single still frame.

Finally, record a performance trace with CPU throttled ×4 while scrolling the landing page and hovering the tray. There must be no long frames over 50ms from the site's own code.

### Step 8. Accessibility and content checks
- One H1 per page; landmarks and `aria-labelledby` present; visible focus on every control; touch targets of at least 44px; all form controls labelled; the page is readable with JS disabled.
- Run the contrast script again.
- Run the leftover-brand search (Appendix 5) across the whole output, including `<title>`, meta, alt text, aria-labels, JSON, JS and CSS comments, and any Sheet or Script. It must return zero hits.
- Every `null` in the config must appear as a visible labelled placeholder, and in the report.

## D. Acceptance checklist

- [ ] The same sections, in the same order, with the same interactions as the source (Appendix 1).
- [ ] The same motion and effects (Appendix 3), only `transform` and `opacity` animated (plus the source's four colour transitions), and reduced motion respected.
- [ ] No text, image, phone, email, map link, doctor, review or Sheet from the original clinic remains anywhere, including meta tags, alt text, aria-labels, page titles, comments and the Sheet. The Appendix 5 search returns zero hits.
- [ ] Every real value comes from `client.config.json`; none is typed into components.
- [ ] Every text and button contrast pair passes WCAG AA.
- [ ] All placeholders are visible and labelled; none is left unmarked.
- [ ] The list of placeholders still to be confirmed by the client is complete.

## E. Output

1. The new site in its own folder, `../{clinic.slug}/`, with `client.config.json`, `README.md` and `PLACEHOLDERS.md` (grouped like the source's, per section and per service page).
2. A short report (`REPORT.md`, and summarised in chat) covering:
   - what changed and what was kept unchanged;
   - every placeholder;
   - contrast results;
   - results of the form-state tests;
   - checklist results;
   - full-page screenshots at **390px and 1440px** of the landing page and one service page (Appendix 7).

---

## Appendix 1. Structure specification

**Stack:** plain HTML, CSS and JS generated by Node ESM template functions, with no dependencies. `npm run build` writes `index.html` and `services/<slug>/index.html`. `npm start` serves on port 4173 with folder routing. Files: `build/{config,data,partials,landing,service-template,services-content,build,serve}.mjs`, `assets/css/site.css`, `assets/js/site.js`, `assets/js/accent3d.js`.

**Head (every page):** charset; viewport; title; description; `theme-color` = ink; inline `document.documentElement.className='js'` (the html starts as `no-js`); preconnect to both Google Fonts origins; the fonts stylesheet with `display=swap`; `site.css`; `site.js` deferred. Then the inline SVG sprite at the top of the body.

**Header (sticky, `theme-dark`):** skip link → `#main`; brand (logo mark 36px plus serif `short` 1.3rem/600 with sans `descriptor` .72rem in silver); desktop nav ≥1100px (Services, About, Doctors, Branches, Gallery, Reviews, Contact, FAQ) with scroll-spy and a red 2px underline; "Call {primary}" quiet pill ≥560px; 44px menu button <1100px opening a two-column mobile nav.

**Landing, in order:**
1. **Hero** (`.hero-slot`, Ink): the supplied hero, or a stand-in with a chip, the H1 (clinic name, max 14ch) and the tagline.
2. **Services** `#services`, dark Ink: section head (eyebrow, H2 left 7fr; intro right 5fr, bottom-aligned) with the arch parallax layer (speed .4) behind it; tray of five cards (graphite gradient, steel border, 18px radius, min-height 340px, 84px silver service mark, H3 serif, summary in silver, an "Explore {name}" underlined link stretched over the card); grid of 6 columns (3 cards of span 2, then 2 of span 3) ≥1024; span 3 each at 760–1023; horizontal scroll-snap at 84% width below 760, with the "Swipe to see all" hint.
3. **About** `#about`, Pearl: 5fr photo frame (4:5, parallax inner .12) | 6fr copy (H2, two lead paragraphs in slate, a three-stat row with hairline dividers; stacked below 480).
4. **Doctors** `#doctors`, Mist: section head; per branch a group head (H3 name plus chip if unconfirmed) and a two-column grid of doctor cards (180px 4:5 photo | name serif 1.6rem/600, qualification, a dl with Specialty and Branch, bio, ghost "Book with this doctor"). Placeholder cards are dashed.
5. **Branches** `#branches`, dark Graphite: two cards (16:7 SVG map placeholder with a red pin only if confirmed; H3; info list with pin, phone and clock icons; primary magnetic "Get directions" and ghost "Call {name}").
6. **Gallery** `#gallery`, Pearl: section head with arch parallax (.3); four pill tabs (active = ink with a red dot); CSS-columns masonry (2 columns, 3 at ≥760) of button tiles; lightbox dialog.
7. **Reviews** `#reviews`, dark Ink: 340px rating card (serif 4.5rem value, five gold stars, text, "Read all reviews on Google" link) | carousel (cards: avatar, name, stars, blockquote in silver, placeholder chip; 1 / 2 / 3 per view at <640 / ≥640 / ≥1300), with prev, next, pause and an "n of N" status.
8. **Contact** `#contact`, Pearl: 7fr form card (two-column grid ≥640: Name\*, Phone\* with hint, Service\*, Preferred branch\*, Preferred date, Message full width; "(required)"/"(optional)" in the labels; magnetic "Request appointment"; a note; a status box) | 5fr stacked contact cards.
9. **FAQ** `#faq`, Mist: 4fr sticky head (top 110px) | 7fr accordion (an h3 wrapping a full-width 64px button, a 28px disc with a plus that turns red with a minus when open).
10. **Footer**, Ink: four columns ≥900 (brand with logo, tagline and social chips | branches | section links | service links), then a bottom bar with copyright and the "Designed by" credit.
11. **Call bar**, fixed, under 900px only: full-width red "Call now: {primary} {phone}", slides in after 320px of scroll; the body gets 76px of bottom padding.

**Service page template, in order:**
1. Dark header: breadcrumb (Home / Services / name); H1 = service name; lead in silver; draft pill; magnetic "Talk to a specialist" (→ `#talk`) and ghost "Call {phone}"; a 420px accent circle (SVG poster, then the 3D canvas) with a red floor glow and `view-transition-name: accent-{slug}`.
2. Pearl: blush draft banner; section head "Common problems / What patients notice" with a draft pill; auto-fill grid (min 260px) of problem cards (48px mist icon tile, H3 1.625rem/600, notice in 1rem slate; hover lifts 4px with a soft shadow fade and the icon tile turning blush with an accentHover icon); facial-trauma only: the Ink "First steps after an injury" block (4fr title, chip and draft | 8fr ordered list).
3. Mist: "Why they happen", a definition list (serif dt 1.5rem | slate dd; 4fr/8fr ≥760).
4. Pearl: "Common causes", a two-column list with rotated-square bullets.
5. Dark: "Solutions / Treatment options", rows of name | What it involves | Recovery (three columns ≥900), with an optional chip.
6. Pearl: "What to expect", three steps with numbered discs on a top hairline; the first disc is red.
7. Mist: "FAQ / {Service} questions", sticky head and accordion.
8. Dark Graphite `#talk`: CTA band (eyebrow "Talk to a specialist", H2 "Book a {service} consultation", text, magnetic button to `../../#contact`, ghost call button), the contact cards, and pill links to the other services.
Then the footer and call bar.

## Appendix 2. Design tokens

```css
:root {
  --ink:{palette.ink}; --graphite:{palette.graphite}; --steel:{palette.steel};
  --pearl:{palette.pearl}; --mist:{palette.mist}; --silver:{palette.silver}; --slate:{palette.slate};
  --red:{palette.accent}; --red-hover:{palette.accentHover}; --blush:{palette.blush}; --gold:{palette.gold};
  --serif:"{fonts.serif}", Georgia, "Times New Roman", serif;
  --sans:"{fonts.sans}", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --fs-h1:clamp(3rem,2rem + 5vw,6.5rem); --fs-h2:clamp(2.25rem,1.6rem + 2.6vw,3.75rem);
  --fs-h3:clamp(1.5rem,1.35rem + .5vw,1.75rem); --fs-lead:clamp(1.0625rem,1rem + .3vw,1.1875rem);
  --fs-body:1.0625rem; --fs-small:.9375rem; --fs-micro:.8125rem;
  --r-lg:18px; --r-md:10px; --r-sm:6px;
  --gutter:clamp(16px,4vw,40px); --max:1240px; --section-y:clamp(72px,9vw,136px);
  --ease-out:cubic-bezier(.2,.7,.2,1);
}
```

Keep the token names (`--red` etc.) so the rest of `site.css` works unchanged. Theme classes: default (bg pearl, surface white, text ink, muted slate, line `#D5DAE1`, focus accent); `.theme-dark` (ink, graphite, pearl, silver, steel, focus pearl); `.theme-graphite` (bg graphite, surface ink); `.theme-mist` (bg mist, surface pearl, line `#CDD3DB`).

Derived colours (recompute from the new palette; the source values are given for reference):

| Derived | Rule | Source |
|---|---|---|
| Light line | pearl mixed about 19% toward slate | `#D5DAE1` |
| Mist line / problem hover border | mist mixed about 18% toward slate | `#CDD3DB` |
| Field border | slate mixed about 30% toward white; must be ≥3:1 on white | `#8A929E` |
| Service card gradient | graphite lightened slightly (+6–8 per channel) → graphite → graphite darkened slightly (−5–7 per channel) | `#252A31` → `#1F2329` → `#1A1D22` |
| Card glow | accent at 28% alpha | `rgba(200,16,46,.28)` |
| Card hover border | a dark, accent-tinted steel; keep it close to the dark surface (about 1.2:1 against graphite) | `#4A2530` |
| Accent floor glow | accent at 22% alpha | `rgba(200,16,46,.22)` |
| Silver gradient (service marks) | pearl → silver-light → slate-light → silver → slate | `#F5F6F8 #C9CED6 #8D95A1 #D3D8DF #6B7380` |
| Rim gradient end | accent lightened 8% | `#E0213F` |
| Map tile / roads | ink darkened slightly / graphite lightened | `#181B20` / `#262B32` |
| Lightbox overlay | ink at 94% | `rgba(10,12,15,.94)` |
| 3D metal colour | silver lightened | `0xD7DBE1` |

Type: headings serif 500 (h1, h2) / 600 (h3), `letter-spacing:0`, `text-wrap:balance`; h1 lh .98 with -.02em tracking; h2 lh 1.04, max 18ch; body 17px, lh 1.6; `p` max 68ch. Eyebrow: 15px sans 500 in the muted colour, with an 18×2px accent tick before it, sentence case. Placeholder chip: 13px sans 500, ink on blush, a 6px accent dot, pill shape. Buttons: 48px minimum, pill, 15px/600; primary accent with white text and accentHover on hover; ghost uses a currentColor border and inverts on hover; quiet uses a 7%/13% text-colour tint.

Breakpoints: 480, 560, 640, 720, 760, 860, 900, 1000, 1024, 1100, 1300 (see the source's `ANALYSIS.md` for the effect of each).

## Appendix 3. Motion specification (copy exactly)

| Effect | Trigger | Values | Reduced motion |
|---|---|---|---|
| Reveal | IO threshold .08, rootMargin `0 0 -8% 0`; `.motion` on `<html>` only when motion is allowed | opacity 0→1, translate3d(0,22px,0)→none, .8s `--ease-out`; remove the classes 1400ms after entry | Not applied |
| Stagger | children of `[data-stagger]` | delay `i × 70ms` | Not applied |
| Parallax | scroll, rAF, only while visible (IO rootMargin 20%) | `translate3d(0,var(--py),0)`, `--py = ((rect centre − vh/2)/vh) × speed × 100px`; speeds: services arch .4, gallery arch .3, about photo inner .12 | `transform:none` |
| Card tilt | pointermove, fine pointer | rotateY (x−.5)×10deg, rotateX (.5−y)×8deg, .5s `--ease-out`; reset on leave | Off |
| Card glow | hover/focus-within | radial 420px at the cursor, accent .28; opacity .35s | Instant |
| Magnetic | pointermove, fine pointer, `[data-magnetic]` | translate(offsetX×.22, offsetY×.3), .35s `--ease-out` | Off |
| Counter | IO .6, only when `confirmed` | 1400ms, easeOutCubic, locale format | Final value immediately |
| FAQ | click | panel `panelIn` .35s (opacity, translateY −6px→0); plus bar rotate .3s | Instant |
| Gallery tile | hover | scale .985, .5s | Instant |
| Lightbox | open/close | overlay opacity .3s; figure scale .94→1 .45s `--ease-out`, opacity .35s; hide 300ms after close; swipe threshold 50px | Instant |
| Carousel | buttons, drag, auto | auto-advance 6000ms; pause on hover, focus, off screen (IO .4), hidden tab, or the button; mouse momentum v×.94 per frame until below .5; wraps to the start | No auto, no glide, pause button hidden |
| Call bar | scrollY > 320 | translateY(110%)→0, .35s | Instant |
| Problem card | hover (hover devices) | translateY(−4px) .6s; shadow layer opacity .6s | Instant |
| Page morph | cross-document View Transition | shared `view-transition-name: accent-{slug}`, .55s `cubic-bezier(.3,.7,.2,1)` | `navigation:none` |
| 3D accent | IO, then idle, then dynamic import of `three@0.160.0/build/three.module.min.js` | Canvas fades in .8s, poster fades out .6s; settle turn from y −1.4 to 0 rad; pointer ±.4 rad y, ±.175 rad x; scroll +x up to .5 rad over 900px; lerp .07, stop below .0008; render only while visible and the tab is shown; DPR ≤2; brushed roughness map; studio environment with two red panels and red rim lights 5.5 / 2.5 | One still frame, no listeners |

There's no looping animation anywhere. The 3D geometry builders (`crown`, `implant`, `jaw`, `face`, `veneer`) are copied unchanged from the source `accent3d.js`.

## Appendix 4. Booking module (only when `booking.enabled` is true; not in the source)

Keep the source form's look and its first six fields. Add a "Preferred time" select (from `slotPeriods`, loaded for the chosen date and branch) and a hidden honeypot field `website` (visually hidden, `tabindex="-1"`, `autocomplete="off"`).

**API contract (Apps Script web app, JSON):**
- `GET {endpoint}?action=slots&branch={id}&date=YYYY-MM-DD` returns `{ ok:true, periods:[{id,label,available:boolean}] }`
- `POST {endpoint}` with body `{name,phone,service,branch,doctorId?,date,period,message,website}` returns `{ ok:true, ref }` or `{ ok:false, code }`
- Codes: `INVALID`, `SLOT_TAKEN`, `OUT_OF_WINDOW` (date before today or after `windowDays`), `CLOSED` (a Sunday period not in `sunday.periods`, or Sunday when `sunday.open` is false), `SPAM` (honeypot filled; respond `ok:true` without saving), `SERVER`.

**Sheet `Bookings` columns:** Timestamp, Ref, Name, Phone, Service, Branch, Doctor, Date, Period, Message, Status (`pending` / `confirmed` / `expired` / `cancelled`), Source.

`pendingExpiryHours` sets a pending row to `expired` (time-driven trigger). Email `adminEmail`, plus `doctorRouting[doctorId]` if set. `capacityPerPeriod` `null` means one booking per period.

**UI states**, each shown in the existing `role="status"` box using the same voice:
- loading slots (the select is disabled with "Loading times…");
- no times left;
- submitting (button `aria-busy`, label "Sending request…");
- success ("Request sent. We will call {phone} to confirm.");
- each error code with a fix ("That time has just been taken. Choose another time.", and so on);
- network failure ("We could not send your request. Check your connection, or call {primaryPhone}.").

## Appendix 5. Leftover-brand search

Search the whole output folder (and the Sheet and Script, if any). Each of these must return zero matches unless the new clinic genuinely uses that word:

```
Sree Mithra|Mithra|Maxface|Tanuku|Tadepalligudem|West Godavari|Velpur|Venkatarayapuram|Satya Plaza|Masjid|534211|88192|8819220055|Subbareddy|Sriramu|S\.R\.S|Lakshmi|G\.V\.N
```

Also search for the source's placeholder wording that names it: "Suggested: the Tanuku treatment room".

## Appendix 6. Contrast script

```js
// node contrast.mjs  — edit P to the new palette
const P = { ink:'#14171C', graphite:'#1F2329', pearl:'#F5F6F8', mist:'#E9ECF1', silver:'#B8BFC9', slate:'#5A6270', accent:'#C8102E', accentHover:'#9E0B24', blush:'#FBE9EC', gold:'#D4A437', white:'#FFFFFF', field:'#8A929E' };
const lin = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255).map(c => c <= .03928 ? c/12.92 : ((c+.055)/1.055)**2.4);
const L = h => { const [r,g,b] = lin(h); return .2126*r + .7152*g + .0722*b; };
const cr = (a,b) => { const x = L(a), y = L(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
const pairs = [
  ['ink','pearl',4.5],['ink','mist',4.5],['ink','white',4.5],['ink','blush',4.5],
  ['slate','pearl',4.5],['slate','mist',4.5],['slate','white',4.5],['slate','blush',4.5],
  ['pearl','ink',4.5],['pearl','graphite',4.5],['silver','ink',4.5],['silver','graphite',4.5],
  ['white','accent',4.5],['white','accentHover',4.5],
  ['gold','graphite',3],['accent','pearl',3],['pearl','ink',3],['accent','blush',3],['field','white',3]
];
for (const [a,b,min] of pairs) { const r = cr(P[a],P[b]); console.log(r >= min ? 'PASS' : 'FAIL', r.toFixed(2), `${a} on ${b} (min ${min})`); }
```

## Appendix 7. Screenshots

Use the built-in browser if it gives a full-size viewport. Otherwise use headless Chrome or Edge over the DevTools protocol with Node 18+:

```js
// node shot.mjs <url> <width> <outPrefix> [sliceHeight] [cpuRate]
import { spawn } from 'node:child_process'; import { writeFile } from 'node:fs/promises';
const [url, width='1440', out='shot', slice='1000', cpu='1'] = process.argv.slice(2);
const browser = process.env.BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9300 + Math.floor(Math.random()*500);
const proc = spawn(browser, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.TEMP || '/tmp'}/shot-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms)); let ws;
for (let i = 0; i < 40 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} await sleep(250); }
await new Promise(r => ws.onopen = r); let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); pend.get(m.id)?.(m); pend.delete(m.id); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const W = +width;
await send('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 768 });
await send('Emulation.setCPUThrottlingRate', { rate: +cpu });
await send('Page.navigate', { url }); await sleep(4000);
const ev = async x => (await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result?.result?.value;
await ev(`document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));1`); await sleep(1500);
const H = await ev('document.documentElement.scrollHeight'), sh = +slice;
for (let y = 0, n = 0; y < H; y += sh, n++) {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 75, captureBeyondViewport: true, clip: { x: 0, y, width: W, height: Math.min(sh, H - y), scale: 1 } });
  await writeFile(`${out}-${n}.jpg`, Buffer.from(r.result.data, 'base64'));
}
console.log('scrollWidth', await ev('document.documentElement.scrollWidth'), 'of', W); ws.close(); proc.kill(); process.exit(0);
```

To test reduced motion, add `await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });` before navigating. A `scrollWidth` larger than the width means there's a horizontal overflow, which fails the check.

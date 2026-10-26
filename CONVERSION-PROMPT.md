# Conversion prompt: dental clinic site → Ratna Nursing Home (or any hospital)

This folder holds a full copy of `MAX-DENTAL` (the Sree Mithra Dental & Maxface Specialists site). The file has two parts:

- **Part 1** is the line-by-line analysis: every place where the source is tied to its own clinic or to dentistry.
- **Part 2** is the prompt. Fill in the intake form (section B), then paste everything from "PROMPT START" to the end into a new Claude Code session opened in this folder.

`MASTER-PROMPT.md` and `ANALYSIS.md` came from the source. They cover a dental-to-dental rebuild. This file covers the harder case: turning a dental specialty clinic into a general hospital or nursing home.

---

# Part 1. Analysis of the source code

## 1.1 How the site works

| Layer | File | What it does |
|---|---|---|
| Data | `build/data.mjs` | `SITE` (name, tagline, Google link, rating, stats), `BRANCHES` (2), `SERVICES` (5, each with a `kind` that picks an icon and a 3D model), `DOCTORS` (4). Unknown values are `null` and render as labelled placeholders. |
| Medical copy | `build/services-content.mjs` | One `CONTENT[slug]` object per service: `lead`, `problems[{icon,title,notice,why}]`, `causes[]`, `treatments[{name,involves,recovery,tbc?}]`, `expect[3]`, `faq[[q,a]]`, and an optional `emergency{title,steps,note}`. Text in `[brackets]` turns into a pink "to be confirmed" chip. |
| Shared partials | `build/partials.mjs` | `esc`, `tbc`, `icon`, the inline SVG sprite (UI icons, problem icons, silver service marks), the parallax `archLayer`, `header`, `footer`, `head`, `branchCard`, `contactCard`, `callBar`. |
| Landing | `build/landing.mjs` | Hero slot, then Services, About, Doctors, Branches, Gallery, Reviews, Contact and FAQ. It also exports `accordion()`. |
| Service pages | `build/service-template.mjs` | One template, rendered once per service: header with the 3D accent, Problems, Why, Causes, Treatments, What to expect, FAQ, and the "Talk to a specialist" band. |
| Build / serve | `build/build.mjs`, `build/serve.mjs` | Writes `index.html` and `services/<slug>/index.html`, and serves them on port 4173 with folder routing. |
| Styles | `assets/css/site.css` (688 lines) | Tokens, three themes (`theme-dark`, `theme-graphite`, `theme-mist`) and every component. |
| Behaviour | `assets/js/site.js` | Progressive enhancement in one IIFE: mobile nav, scroll spy, reveals and stagger, parallax, card tilt, magnetic buttons, counters, accordion, gallery tabs, lightbox, carousel, doctor prefill, form validation, call bar, and lazy loading of the 3D accent. |
| 3D | `assets/js/accent3d.js` | Loads three.js r160 from jsDelivr. A brushed-silver material with red rim light, rendered only on demand. Procedural models: `crown`, `implant`, `jaw`, `face`, and `veneer` as the fallback. |

Generated output: `index.html` and `services/{dental,cosmetology,implants,facial-trauma,maxillofacial}/index.html`. Never edit these by hand.

## 1.2 Clinic-specific values (must change)

| File:line | Hard-coded value |
|---|---|
| `build/data.mjs:4-7` | Name, short name, tagline, Google Maps search URL for "Sree Mithra Dental Tanuku" |
| `build/data.mjs:17-34` | Tanuku address, phone `088192 20055`, hours and directions URL; Tadepalligudem stub |
| `build/data.mjs:44-63` | Doctors Subbareddy and Lakshmi, with their name note |
| `build/partials.mjs:99,111` | `const tanuku = BRANCHES[0]`, and the label "Call Tanuku" typed literally |
| `build/partials.mjs:105` | The wordmark "Sree Mithra / Dental & Maxface Specialists" is typed in instead of read from `SITE` |
| `build/partials.mjs:165` | Call bar: "Call now: Tanuku …" (uses `BRANCHES[0]`) |
| `build/partials.mjs:201,205` | `theme-color` `#14171C`; Google Fonts URL |
| `build/landing.mjs:47` | "Suggested: the Tanuku treatment room in daylight" |
| `build/landing.mjs:112` | "Two clinics in West Godavari" |
| `build/landing.mjs:185` | Placeholder review text mentions "Tadepalligudem" |
| `build/landing.mjs:237` | FAQ: "Call the Tanuku branch…", "Tadepalligudem number…" |
| `build/landing.mjs:266` | `<title>` and meta: "Tanuku and Tadepalligudem" |
| `build/service-template.mjs:22` | Meta suffix "Tanuku and Tadepalligudem" typed in |
| `build/service-template.mjs:119` | "Call Tanuku" typed in |
| `assets/js/site.js:1` | Comment "Sree Mithra Dental" |
| `assets/js/site.js:316` | **The form fallback message has the phone number typed in**: "call the Tanuku branch on 088192 20055". It leaks if it isn't changed. |
| `assets/css/site.css:1` | Comment with the clinic name |
| `package.json:2,4` | `name` and `description` |
| `README.md`, `PLACEHOLDERS.md`, `ANALYSIS.md`, `MASTER-PROMPT.md` | All describe the source clinic |

## 1.3 Dental-specific design and copy (must change for a hospital)

| File:line | What is dental |
|---|---|
| `build/partials.mjs:7-9` | `TOOTH`, `FACE` and `JAW` SVG paths that other icons are built from |
| `build/partials.mjs:39-63` | 25 problem icons (`p-ache`, `p-cold`, `p-gum`, `p-cavity`, `p-wisdom`, `p-root` and so on). Only `p-alert`, `p-check`, `p-swell` and `p-lesion` can be reused. |
| `build/partials.mjs:68-88` | Silver service marks `m-crown`, `m-veneer`, `m-implant`, `m-face`, `m-jaw`, and the `serviceMark` kind map |
| `build/partials.mjs:91-94` | `archLayer`: a dental-arch drawing (U-curves with 14 tooth circles) behind the section headings |
| `build/landing.mjs:25-38` | "Five specialities, one team", "From a routine filling to jaw surgery", "Swipe to see all five" |
| `build/landing.mjs:50-52` | About copy: toothache, fractured jaw, oral and maxillofacial surgeon, X-rays |
| `build/landing.mjs:121-125` | Gallery: "Dental chair", "Sterilisation area", "Digital X-ray unit"… |
| `build/landing.mjs:185` | Placeholder review "such as an implant or a root canal" |
| `build/landing.mjs:222` | Form placeholder: "pain in a lower back tooth for three days" |
| `build/landing.mjs:236-244` | FAQ: teeth, gums and jaw, dental reports, "dental or facial emergency", "maxillofacial surgeon" |
| `build/landing.mjs:266` | Meta description lists dental services |
| `build/service-template.mjs:51` | Draft banner: "written for the clinic's **dentists**" |
| `build/services-content.mjs` (all 167 lines) | All of the medical copy is dental. The `emergency` block exists only on `facial-trauma`. |
| `assets/js/accent3d.js:124-262` | 3D models of a molar, implant, mandible, face and six front teeth. **Any unknown `kind` falls through to `veneer`**, so a new hospital service would show teeth. |
| `assets/css/site.css:245-251` | The tray grid assumes **exactly five** cards (3 of span 2, then `nth-child(n+4)` span 3) |

## 1.4 Colours typed in outside the tokens

`site.css` lines 257 (`#252A31`, `#1A1D22`), 265 and 572 (`rgba(200,16,46,…)`), 273 (`#4A2530`), 351 (`#181B20`), 395, 403 and 484 (SVG data URI `%235A6270`); `partials.mjs` lines 17-23 (gradient stops, `#C8102E`, `#E0213F`), 134-138 (map `#262B32`, pin `#C8102E`); `accent3d.js` lines 27-28 and 99-100 (`0xC8102E`), 32 (`0xD7DBE1`).

## 1.5 Defects and traps found while reading

1. **`build.mjs` never deletes old output.** When the slugs change, the five dental pages stay in `services/`, with the old brand, and they still get deployed. Delete them before you build.
2. **`site.js:316` has the phone number typed in** (see 1.2). It's the only clinic fact in the JS.
3. The **"Call Tanuku" labels** in `partials.mjs:111` and `service-template.mjs:119` are typed in, even though the phone number next to them comes from data.
4. The **header wordmark** (`partials.mjs:105`) ignores `SITE.short`.
5. The **3D fallback** is `veneer` (see 1.3).
6. The **tray layout** works only with five services (see 1.3).
7. `service-template.mjs:100` always renders exactly three "What to expect" steps, so `expect` must have three entries or the page shows `undefined`.
8. The phone check (`site.js:296`) accepts Indian-style numbers only. That's fine for an Indian hospital, but its error text says "10-digit mobile".
9. The form sends nothing. It validates, then tells the visitor to call (no backend, by design).
10. External runtime dependencies: Google Fonts and jsDelivr (three.js).

## 1.6 Generic parts to keep as they are

The layout, themes, type scale, spacing, every animation and interaction in `site.js`, the accordion, lightbox, carousel, form validation pattern, placeholder system (`tbc`, `pending`, dashed cards), accessibility work (skip link, landmarks, 44px targets, focus styles, reduced motion, no-JS reading), the build and serve scripts, and the UI icons `i-*` in the sprite.

---

# Part 2. The prompt

---

PROMPT START

You are converting a finished static clinic website into a website for a different healthcare provider. The folder you're in is a full copy of the source site, **Sree Mithra Dental & Maxface Specialists** (a two-branch dental and maxillofacial clinic). The new provider is described in the intake form in section B. Work **in this folder**. Read `CONVERSION-PROMPT.md` Part 1 first, because it lists every clinic-specific and dental-specific line. Then read every file in `build/` and `assets/` in full before you change anything.

## A. Rules

1. **Keep the design system.** Keep the layout grid, themes, type scale, spacing, radii, buttons, the section rhythm (dark / light / mist alternation), every motion value and interaction in `assets/js/site.js`, and every accessibility feature. Change only what the intake form or these rules require.
2. **Nothing from the source clinic may survive.** That covers its name, branches, addresses, phones, map links, doctors, Google link and placeholder text naming it, in any page, title, meta, alt text, aria-label, comment, JS string or doc. The search in section E must return zero hits.
3. **Nothing dental may survive** unless the new provider genuinely offers dentistry. That covers tooth icons, the dental-arch drawing, the dental 3D models, dental copy, FAQ, gallery labels and form placeholder.
4. **Never invent facts.** Don't make up doctor names, qualifications, registration numbers, bed counts, years, patient numbers, ratings, reviews, photos, prices, insurance partners, accreditations (NABH, NABL, ISO) or awards. If a value is `null` in the intake form, render the existing labelled placeholder (pink "to be confirmed" chip, dashed card, or muted "{Field} to be confirmed" line) and list it in `PLACEHOLDERS.md`.
5. **Healthcare advertising limits.** Don't write "best", "No.1", "guaranteed", "painless", "100% success", "24x7", "24 hours", "round the clock" or similar, unless the form gives that exact claim with `"confirmed": true`. Don't name competitors. Don't use before-and-after photos.
6. **Emergencies.** Never imply emergency cover the form doesn't confirm. Every page that mentions emergencies must tell the visitor what to do in a life-threatening situation (call the national ambulance number from the form, default `108` for India, or go to the nearest emergency department). If `emergency.available24h` isn't `true`, say that emergency hours are to be confirmed.
7. **Obstetrics and ultrasound (India).** If the provider lists obstetrics, gynaecology, ultrasound or fetal scans, add a footer line and a line in the relevant service page with the PC-PNDT statement from `legal.pcpndtNotice`. If that field is `null`, render a chip "PC-PNDT notice wording to be confirmed with client". Never mention sex determination in any other way.
8. **All medical text stays a draft.** Every service page keeps the "Draft, pending doctor review" label and banner until that service has `medicalReviewed: true`. The banner must say "the hospital's doctors", not "dentists". Write medical copy in plain, calm, non-alarming language: what the patient notices, why it happens, common causes, what treatment involves, and recovery. No dosages and no self-treatment advice beyond basic first aid.
9. No stock photos, emojis or clip-art. An image slot without a supplied file stays a labelled frame.
10. Animate only `transform` and `opacity` (keep the source's four existing colour transitions). No looping animations.
11. Every real value comes from data files. Don't type facts into templates. Fix the typed-in values listed in Part 1, 1.2 and 1.5, at their source.

## B. Intake form

Create `build/data.mjs` (and the content file) from this form. ★ means it must be supplied or left `null` so it renders as a placeholder; the source value must never be carried over.

```jsonc
{
  "provider": {
    "name": "Ratna Nursing Home",          // ★ confirm the exact registered spelling
    "short": "Ratna",                      // ★ header wordmark, large serif
    "descriptor": "Nursing Home",          // ★ header wordmark, small sans line
    "type": "nursing-home",                // nursing-home | hospital | multispeciality-hospital | clinic
    "tagline": null,                       // ★ one plain sentence, no superlatives
    "town": null,                          // ★ e.g. city or district, used in titles and meta
    "region": null,                        // ★ used only in branch copy
    "established": null,                   // ★ year, only if confirmed
    "registration": null,                  // ★ Clinical Establishment registration text, shown in the footer if supplied
    "locale": "en-IN",
    "slug": "ratna-nursing-home"
  },
  "palette": {                             // keep the source roles; replace the values only if the brand has colours
    "ink": "#14171C", "graphite": "#1F2329", "steel": "#2E343D",
    "pearl": "#F5F6F8", "mist": "#E9ECF1", "silver": "#B8BFC9", "slate": "#5A6270",
    "accent": null,                        // ★ brand colour for buttons and highlights; null = choose a calm medical accent (e.g. deep teal) and pass the contrast check
    "accentHover": null, "blush": null,    // derive from accent if null (blush = accent at about 10% on white)
    "gold": "#D4A437"
  },
  "fonts": { "serif": "Cormorant Garamond", "sans": "Hanken Grotesk" },
  "logo": { "file": null, "fileOnDark": null, "favicon": null },           // ★
  "hero": { "provided": false, "html": null },                              // ★ approved hero, if one exists
  "emergency": {
    "available24h": null,                  // ★ true/false; never assume
    "phone": null, "tel": null,            // ★ casualty or emergency desk number
    "ambulance": null,                     // ★ own ambulance number, if any
    "nationalAmbulance": "108"
  },
  "stats": [                               // ★ real numbers only; a counter animates only when confirmed is true
    { "label": "Years of service", "value": null, "suffix": "+", "confirmed": false },
    { "label": "Beds", "value": null, "suffix": "", "confirmed": false },
    { "label": "Patients treated", "value": null, "suffix": "+", "confirmed": false }
  ],
  "branches": [                            // one or more; exactly one primary
    {
      "id": "main", "name": null, "primary": true, "confirmed": false,      // ★
      "addressLines": null, "phone": null, "tel": null,                      // ★
      "email": null, "whatsapp": null,
      "hours": null,                       // ★ OPD hours, e.g. [["Mon to Sat","9 am to 1 pm, 5 pm to 8 pm"]]
      "directions": null                   // ★ Google Maps directions URL
    }
  ],
  "services": [                            // ★ 4 to 8 departments; kind picks the icon and the 3D model (section C3)
    { "slug": "general-medicine", "name": "General Medicine", "kind": "stethoscope", "summary": null, "medicalReviewed": false },
    { "slug": "obstetrics-gynaecology", "name": "Obstetrics & Gynaecology", "kind": "cradle", "summary": null, "medicalReviewed": false },
    { "slug": "general-surgery", "name": "General Surgery", "kind": "cross", "summary": null, "medicalReviewed": false },
    { "slug": "paediatrics", "name": "Paediatrics", "kind": "heart", "summary": null, "medicalReviewed": false },
    { "slug": "orthopaedics", "name": "Orthopaedics", "kind": "bone", "summary": null, "medicalReviewed": false }
  ],
  "doctors": [                             // ★ real people only; null name → dashed placeholder card
    { "branch": "main", "name": null, "qualification": null, "specialty": null, "registrationNo": null, "photo": null, "bio": null }
  ],
  "facilities": null,                      // ★ optional list, e.g. ["Operation theatre","Labour room","Laboratory","Pharmacy","X-ray"]; only confirmed items
  "insurance": { "cashless": null, "partners": null },                      // ★ never list an insurer or TPA that isn't confirmed
  "google": { "listingUrl": null, "rating": null, "reviewCount": null },    // ★
  "reviews": [],                           // ★ {author,text,date,rating,url}, word for word from Google, with permission
  "gallery": [                             // ★ labels describe the shot needed; file null → labelled frame
    ["Hospital entrance","building","ar-sq"], ["Reception","building","ar-tall"], ["General ward","wards","ar-wide"],
    ["Private room","wards","ar-tall"], ["Operation theatre (empty)","facilities","ar-wide"], ["Laboratory","facilities","ar-sq"],
    ["Pharmacy","facilities","ar-tall"], ["Waiting area","building","ar-pano"], ["Nursing team","team","ar-wide"]
  ],
  "galleryTabs": [["all","All"],["building","Hospital"],["wards","Wards"],["facilities","Facilities"],["team","Team"]],
  "social": { "instagram": null, "facebook": null, "youtube": null },
  "footer": { "credit": null },
  "legal": { "pcpndtNotice": null },       // ★ required wording if obstetrics or ultrasound is offered
  "booking": { "enabled": false }          // the source has no backend; keep false unless a backend is specified separately
}
```

## C. Work, in order

### C0. Clean up and make it data-driven
1. Delete the generated `index.html` and the whole `services/` folder. Then change `build/build.mjs` so that it deletes `services/` itself at the start of every build, so stale pages can never be left behind.
2. Move every remaining typed-in fact into `build/data.mjs`: the wordmark (`SITE.short`, `SITE.descriptor`), the town for titles and meta, and a `PRIMARY` branch helper that replaces every `BRANCHES[0]` and every "Tanuku" label. "Call Tanuku" becomes `Call ${PRIMARY.name}`, or "Call us" when there's only one branch.
3. Pass the form fallback message to `site.js` through `data-fallback` on `#appointment-form`, built from the primary branch's name and phone. Delete the typed-in string at `site.js:316`. If the phone is `null`, the message says to call the hospital, with the number to be confirmed.
4. Rename `package.json` `name` and `description`. Replace the source comments in `site.css:1-2`, `site.js:1` and `accent3d.js:1-3`.

### C1. Colours
Generate the `:root` palette from the form. Replace every typed-in colour in Part 1, 1.4 with a token, or with a value derived from the new accent (glows = accent at 28% and 22% alpha; hover border = a dark mix of steel and accent; rim gradient end = accent lightened 8%; 3D rim lights and panels = accent). Run the contrast script from `MASTER-PROMPT.md` Appendix 6 with the new palette. Every pair must pass AA. Fix failures by changing lightness only, and report what you changed.

### C2. Icons and drawings (replace the dental ones)
In `build/partials.mjs`:
- Delete `TOOTH`, `FACE` and `JAW` and every icon built from them. Keep `p-alert`, `p-check`, `p-swell` and `p-lesion` only if the new copy uses them.
- Draw a new set of problem icons in the **same style**: 24×24 viewBox, `stroke-width 1.5`, round caps and joins, `currentColor`, no fills. Draw only what the service content needs, for example fever/thermometer, cough/lungs, heart, blood-pressure cuff, glucose drop, stomach, kidney, pregnancy, baby, child, bone/joint, fracture, wound, head, pill, syringe, drip bag, calendar check.
- Replace the five silver service marks with marks for the new `kind`s (section C3). Use the same `mark()` builder: silver gradient body, brush pattern, accent rim stroke, dark detail lines.
- Replace `archLayer` (the dental arch) with a neutral drawing in the same spirit and at the same opacity: faint concentric contour lines, with a single calm pulse/ECG line or a soft grid of plus marks. Keep the `data-parallax` speeds (.4 for services, .3 for gallery).

### C3. 3D accents
In `assets/js/accent3d.js`, keep the renderer, environment, material, lighting, interaction, on-demand loop and reduced-motion behaviour **exactly**. Replace the dental geometry builders with procedural, medical, non-anatomical models in the same brushed-silver style:

| kind | Model |
|---|---|
| `cross` | A medical plus sign: two rounded boxes (`ExtrudeGeometry` of a rounded-rect plus shape, bevelled) |
| `heart` | A stylised heart: extruded, bevelled heart `Shape` (two arcs into a point), not anatomical |
| `stethoscope` | Chest piece (lathe disc and rim) plus tubing (`TubeGeometry` along a Catmull-Rom curve) and two earpieces |
| `bone` | A shaft (`CylinderGeometry`) with two pairs of spheres at each end, softly blended by scaling |
| `cradle` | A mother-and-child abstract: two nested lathe arcs (a large protective curve around a small sphere). Abstract and tasteful, never anatomical |
| `pill` | A capsule (`CapsuleGeometry`) split into two halves with a seam, at a slight tilt |
| `drop` | A lathe teardrop, for laboratory and diagnostics |

The fallback for an unknown `kind` must be `cross`, never a dental model. Keep each model inside the same frame as the old ones (it should fit the 420px circle with similar padding), and keep the poster SVG mark matching the 3D model.

### C4. Landing page copy (`build/landing.mjs`)
Rewrite every eyebrow, H2 and intro for a hospital, at about the same length as the source (±20%), in the same plain, second-person voice. For example:
- Services: "What we treat" / "{N} departments, one hospital" / one line about continuity of care. The swipe hint uses the real count ("Swipe to see all {N}").
- About: two paragraphs about how the hospital works (consultation, admission when needed, nursing care, follow-up), with no claims. The photo caption suggests a real shot, such as "Suggested: the main ward in daylight".
- Doctors: "Consultants and doctors" / "The people you will see".
- Branches: if there's one branch, title it "Find us" and show one card at full width. If there are several, use "{N} locations in {region}".
- Gallery: use the labels and tabs from the form.
- Reviews: keep the placeholder system. The placeholder texts must not mention dental treatments or any town.
- Contact: the form placeholder becomes, for example, "For example: fever and cough for three days". Add an "Emergency? Call {emergency phone or 108}" line under the form note.
- FAQ: rewrite for a hospital: booking an OPD appointment; what to bring (ID, previous reports, prescriptions, insurance card); visiting hours (chip if unknown); admission and discharge; payment, insurance and cashless (chips unless confirmed); emergencies (rule 6); which doctor or department to see.
- Title and meta: `{name} | {town}`, and a description listing the real departments.

Optional sections, rendered **only** when their field isn't `null`, using existing components and no new styles where possible:
- `facilities`: a row of `svc-other`-style pills inside the About section, under the stats.
- `insurance.partners`: a line of pills in the FAQ payment answer.
- `emergency.available24h === true`: a slim Ink band directly after the hero with the emergency number as a primary button. Otherwise there's no band.

### C5. Service pages
1. Write `build/services-content.mjs` again, from scratch, with one entry per service in the form, using **the same shape** (`lead`, 4-7 `problems`, 5-7 `causes`, 4-6 `treatments`, **exactly 3** `expect`, 4 `faq`). Use `[to be confirmed …]` chips for anything clinic-specific: equipment, procedures actually offered, stay length, anaesthesia, costs, timings.
2. Give an `emergency` block (first steps) to every department where urgent symptoms are common, such as General Medicine (chest pain, breathlessness, stroke signs), Obstetrics (bleeding, reduced fetal movement, labour signs), Paediatrics (high fever with drowsiness, fits, breathing difficulty), and Surgery/Orthopaedics (injuries, fractures). The first step is always "call {nationalAmbulance} or go to the nearest emergency department" for life-threatening signs.
3. In `service-template.mjs`: the banner says "the hospital's doctors"; the meta suffix comes from data; "Call {primary}" comes from data; the CTA becomes "Book a consultation in {service}" if `Book a ${lower} consultation` reads badly for a department name.

### C6. Layout changes the service count forces
Change the `.tray` grid in `site.css` so it works for any count from 4 to 8, while keeping the look at five:
- ≥1024px: 3 per row; if the last row has 2 cards they span 3 columns each (the source look); if it has 1, it spans the full width. Use `:nth-last-child` selectors, or have the build add a class `tray--n{count}`.
- 760–1023px: 2 per row; a lone last card spans the full row.
- Below 760px: horizontal snap scrolling, unchanged.

### C7. Docs
Replace `README.md` (same structure, new name), `PLACEHOLDERS.md` (regrouped per section and per department, listing every `null` in the form) and `ANALYSIS.md` (remove it, or update it to describe the new site). Keep this `CONVERSION-PROMPT.md` and `MASTER-PROMPT.md` as references, and don't deploy them.

## D. Verify

1. `npm run build`, then `npm start`, and open http://localhost:4173 with the preview (`.claude/launch.json` config `site`).
2. Check the landing page and two service pages at 360, 390, 768, 1024, 1280 and 1440px. There must be no horizontal scroll. The tray layout must be correct for the real service count.
3. Interactions: reveals, stagger, tilt, magnetic buttons, parallax, counters (only confirmed), accordion, gallery tabs with arrow keys, lightbox (Esc, arrows, swipe, focus trap), carousel (buttons, drag, 6s auto-advance, pause), "Book with this doctor" prefill, form errors and the fallback message with the new phone, the call bar under 900px, the 3D accent loading and following the pointer, and the card-to-header morph in Chromium.
4. Repeat with `prefers-reduced-motion: reduce`: nothing moves and the 3D accent is one still frame. Repeat with JS disabled: all text is readable and the FAQ is expanded.
5. Run the contrast script again. Check that each page has one H1, that labels and landmarks are present, and that touch targets are at least 44px.

## E. Leftover search (must return zero hits across the whole folder, excluding `CONVERSION-PROMPT.md`, `MASTER-PROMPT.md` and `ANALYSIS.md` if kept)

Brand:
```
Sree Mithra|Mithra|Maxface|Tanuku|Tadepalligudem|West Godavari|Velpur|Venkatarayapuram|Satya Plaza|Masjid|534211|88192|8819220055|Subbareddy|Sriramu|S\.R\.S|Lakshmi|G\.V\.N|sree-mithra
```
Dental (allowed only if the hospital really has a dental department):
```
tooth|teeth|dental|dentist|dentine|enamel|gum line|gums|cavity|cavities|root canal|filling|crown|veneer|implant|denture|wisdom|maxillofacial|jaw|smile|whitening|m-crown|m-veneer|m-implant|m-jaw|p-ache|p-cavity
```
Superlatives and claims: `best|No\.?\s?1|number one|guarantee|painless|24x7|24/7|24 hours|round the clock` (allowed only where the form confirms the claim).

## F. Report back

Write `REPORT.md` and summarise it in chat: what changed and what was kept; every placeholder still open; contrast results; the leftover-search output; the verification results from section D (say plainly which checks you couldn't run); and screenshots of the landing page and one service page at 390px and 1440px.

PROMPT END

# Codebase analysis: Sree Mithra Dental & Maxface Specialists

Analysed on 18 October 2026. No site code was changed for this document.

Scope: every file that affects what a visitor sees or does.

| File | Role |
|---|---|
| `build/data.mjs` | Site-wide facts: name, tagline, Google link, rating, stats, branches, services, doctors |
| `build/services-content.mjs` | Draft medical copy for the five service pages |
| `build/partials.mjs` | Shared head, header, footer, branch and contact cards, call bar, SVG sprite, service marks, parallax drawing |
| `build/landing.mjs` | Landing page: hero slot and nine sections; also exports the shared `accordion()` |
| `build/service-template.mjs` | The one service-page template, rendered five times |
| `build/build.mjs` | Writes `index.html` and `services/<slug>/index.html` |
| `build/serve.mjs` | Local static server with folder-index routing (port 4173) |
| `assets/css/site.css` | All tokens and styles (one file, 688 lines) |
| `assets/js/site.js` | All progressive interactions (one IIFE) |
| `assets/js/accent3d.js` | Procedural three.js accents for service-page headers |
| `index.html`, `services/*/index.html` | Generated output. Do not edit by hand. |
| `package.json`, `.claude/launch.json` | Scripts and preview config |

## Features named in the brief that do NOT exist in this codebase

The master prompt must not "rebuild" these as if they were source features. Each is listed so nobody goes looking for it.

| Feature asked about | Status in source |
|---|---|
| Mascot (idle bob, eye follow, blink) | **None.** The illustrative element is the set of five silver service marks plus the three.js 3D accents. |
| Particle effects | **None.** |
| Booking backend, Apps Script, Google Sheet, slot loading, honeypot, multi-step form | **None.** There is one single-step form. It validates and then shows a "not connected yet, please call" message (`site.js` lines 289–319). There's no endpoint, no env vars and no Sheet. |
| Google rating breakdown and tooltip | **None.** Only a value, five stars and a count, all placeholders. |
| Telugu or other language versions | **None.** English only (`lang="en"`). |
| Email, WhatsApp, real social links | **None.** Socials are dashed "to be confirmed" chips. |
| Favicon | **None.** No `<link rel="icon">`. |
| Logo, hero image, gallery and doctor photos | **None supplied.** Every slot is a labelled CSS placeholder; there are no `<img>` elements anywhere. |
| Approved hero | **Not in the repo.** A labelled stand-in `<section class="hero-slot">` holds the page's H1. |

---

## Structure

### Pages

| Route | Source | Notes |
|---|---|---|
| `/` | `landing.mjs` → `index.html` | One H1 (in the hero slot) |
| `/services/dental/` | `service-template.mjs` + `CONTENT.dental` | 3D kind `crown` |
| `/services/cosmetology/` | same template + `CONTENT.cosmetology` | 3D kind `veneer` (six-tooth smile) |
| `/services/implants/` | same template + `CONTENT.implants` | 3D kind `implant` |
| `/services/facial-trauma/` | same template + `CONTENT['facial-trauma']` | 3D kind `face`; only page with the emergency block |
| `/services/maxillofacial/` | same template + `CONTENT.maxillofacial` | 3D kind `jaw` |

### Shared vs per-page

| Shared (`partials.mjs`) | Used on |
|---|---|
| `head()`: meta, fonts, CSS, JS, `no-js`→`js` class swap | All pages |
| `sprite()`: inline SVG symbols and gradients | All pages |
| `header()`: skip link, sticky header, desktop nav, mobile nav, "Call Tanuku" | All pages |
| `footer()`: logo placeholder, tagline, socials, branches, section links, service links, copyright, credit | All pages |
| `callBar()`: mobile sticky "Call now" | All pages |
| `branchCard()`: large card with map placeholder | Landing (Branches) |
| `contactCard()`: compact branch card | Landing (Contact) and service pages (section 8) |
| `accordion()` (exported from `landing.mjs`) | Landing FAQ and service FAQ |

### Landing page order

| # | Section id | Theme class | Content |
|---|---|---|---|
| – | (skip link, header) | header uses `theme-dark` | Sticky header |
| 0 | hero slot (no id) | `.hero-slot` (Ink) | Stand-in: placeholder chip, H1 = clinic name, tagline |
| 1 | `#services` | `theme-dark` (Ink) | Eyebrow "What we treat", H2, intro, parallax arch, five service cards ("tray"), mobile swipe hint |
| 2 | `#about` | default (Pearl) | Photo placeholder with parallax inner, H2, two paragraphs, three stats |
| 3 | `#doctors` | `theme-mist` | Grouped by branch: Tanuku (two doctors), Tadepalligudem (two placeholder cards) |
| 4 | `#branches` | `theme-dark theme-graphite` | Two `branchCard`s |
| 5 | `#gallery` | default (Pearl) | Parallax arch, four tabs, nine masonry placeholders, lightbox dialog |
| 6 | `#reviews` | `theme-dark` (Ink) | Rating summary card, six-slide carousel and controls |
| 7 | `#contact` | default (Pearl) | Appointment form (7/12) and two `contactCard`s (5/12) |
| 8 | `#faq` | `theme-mist` | Sticky section head (4/12) and seven-item accordion (7/12) |
| – | footer | Ink | Four columns and a bottom bar |
| – | call bar | fixed, under 900px | "Call now: Tanuku 088192 20055" |

### Service page order (template)

| # | Section | Theme |
|---|---|---|
| 1 | Header: breadcrumb, H1 (service name), lead, draft label, two buttons, 3D accent with SVG poster | `theme-dark svc-hero` |
| 2 | Draft banner, then "Common problems / What patients notice" icon-card grid; facial-trauma adds the "First steps after an injury" block | default |
| 3 | "Why they happen": definition list, one row per problem | `theme-mist` |
| 4 | "Common causes": two-column diamond-bullet list | default |
| 5 | "Solutions / Treatment options": three-column rows (name, involves, recovery) | `theme-dark` |
| 6 | "What to expect": three numbered steps (Consultation, Procedure, Follow-up) | default |
| 7 | "FAQ / {Service} questions": sticky head and accordion | `theme-mist` |
| 8 | `#talk`: CTA band, two `contactCard`s, links to the other four services | `theme-dark theme-graphite` |

Every service section head carries a "Draft, pending doctor review" pill.

---

## Design tokens

### Colour tokens (`:root`, `site.css` lines 4–16)

| Token | Value | Where used |
|---|---|---|
| `--ink` | `#14171C` | Dark section bg, header and footer bg, light-theme text, step numbers, active tab bg, `theme-color` meta |
| `--graphite` | `#1F2329` | Dark surface (cards in dark sections), Branches and Talk section bg, service-card gradient middle |
| `--steel` | `#2E343D` | Dark-theme lines, header border, scrollbars, lightbox buttons |
| `--pearl` | `#F5F6F8` | Default page bg, dark-theme text, form field bg |
| `--mist` | `#E9ECF1` | `theme-mist` bg, photo placeholder bg, problem icon tile, form status bg |
| `--silver` | `#B8BFC9` | Muted text on dark, dashed placeholder borders, arch drawing on dark |
| `--slate` | `#5A6270` | Muted text on light, field hints, arch drawing on light |
| `--red` | `#C8102E` | Primary buttons, eyebrow tick, active nav underline, open-accordion disc, first step disc, focus ring (light), placeholder dot, rim light (SVG and 3D) |
| `--red-hover` | `#9E0B24` | Primary button hover, problem icon hover colour |
| `--blush` | `#FBE9EC` | Placeholder chip bg, draft banner, `::selection`, error field bg, icon hover tile |
| `--gold` | `#D4A437` | Review stars only |

Per-theme variables (`--bg`, `--surface`, `--text`, `--muted`, `--line`, `--focus`):

| Theme | `--bg` | `--surface` | `--text` | `--muted` | `--line` | `--focus` |
|---|---|---|---|---|---|---|
| default (light) | pearl | `#fff` | ink | slate | `#D5DAE1` | red |
| `.theme-dark` | ink | graphite | pearl | silver | steel | pearl |
| `.theme-graphite` (used with `.theme-dark`) | graphite | ink | (dark) | (dark) | (dark) | (dark) |
| `.theme-mist` | mist | pearl | (light) | (light) | `#CDD3DB` | (light) |

### Hard-coded colours (not tokenised)

| Value | Location | Purpose |
|---|---|---|
| `#fff` | `--surface`, `.btn-primary` text, focused field bg, `.step:first-child` text, open-accordion `+` | White |
| `#D5DAE1`, `#CDD3DB` | `--line` light, mist line, `.problem:hover` border | Hairlines |
| `#252A31`, `#1A1D22` | `.svc-card` gradient | Card sheen |
| `rgba(200,16,46,.28)` | `.svc-card::before` | Red hover glow (= red) |
| `rgba(245,246,248,.35)` | `.svc-card::after` | Top-edge sheen |
| `#4A2530` | `.svc-card:hover` border | Red-tinted steel |
| `#EEF0F4`, `#DDE2E8`, `rgba(90,98,112,.06)` | `.photo-ph .ph-inner` | Light placeholder gradient and hatching |
| `#2A2F36`, `#1C1F24`, `rgba(184,191,201,.06)` | lightbox placeholder | Dark placeholder |
| `#181B20` | `.map-ph` | Map tile bg |
| `rgba(10,12,15,.94)` | `.lightbox` | Overlay |
| `rgba(46,52,61,.7)` | `.lb-btn` | Lightbox button bg |
| `#8A929E` | field border | 3.14:1 UI contrast |
| `%235A6270` | select chevron data URI | Slate |
| `rgba(200,16,46,.22)` | `.accent::before` | 3D floor glow |
| `rgba(20,23,28,.04/.16)` | `.problem::after` shadow | Ink shadow |
| `#F5F6F8 #C9CED6 #8D95A1 #D3D8DF #6B7380` | `partials.mjs` `#g-silver` | Silver gradient for service marks |
| `#C8102E`, `#E0213F` | `partials.mjs` `#g-rim`, map pin | Rim light |
| `#5A6270`, `#3B414B` | service mark strokes | Outline and detail |
| `#262B32` | map placeholder roads | |
| `#14171C` | `head()` `theme-color` meta | |
| `0xC8102E`, `0xD7DBE1`, `0xffffff` | `accent3d.js` | Rim lights, red env panels, metal colour, key light |

### Typography

| Role | Family | Weights | Notes |
|---|---|---|---|
| Headings (`--serif`) | Cormorant Garamond → Cormorant → Georgia → Times New Roman | 500 (h1, h2, stat, rating), 600 (h3, brand, doctor name, why-row dt) | Google Fonts, `display=swap` |
| Body and UI (`--sans`) | Hanken Grotesk → Inter → system-ui stack | 400 body, 500 eyebrow/chips/tabs, 600 buttons, labels, h4, FAQ questions | Google Fonts |

| Token | Value |
|---|---|
| `--fs-h1` | `clamp(3rem, 2rem + 5vw, 6.5rem)`, line-height .98, letter-spacing -.02em |
| `--fs-h2` | `clamp(2.25rem, 1.6rem + 2.6vw, 3.75rem)`, lh 1.04, max-width 18ch |
| `--fs-h3` | `clamp(1.5rem, 1.35rem + .5vw, 1.75rem)`, lh 1.15, weight 600 |
| `--fs-lead` | `clamp(1.0625rem, 1rem + .3vw, 1.1875rem)` |
| `--fs-body` | `1.0625rem` (17px), lh 1.6 |
| `--fs-small` | `.9375rem` (15px) |
| `--fs-micro` | `.8125rem` (13px) |

Global type settings: headings `letter-spacing: 0; text-wrap: balance`; `p, li, dd { text-wrap: pretty }`; `p { max-width: 68ch }`; antialiasing, kerning and ligatures on.

Hard-coded type sizes (not tokens): `.svc-card h3` `clamp(1.75rem, 1.5rem + .8vw, 2.125rem)`; `.problem h3` 1.625rem; `.why-row dt` 1.5rem; `.doctor h4` 1.6rem; `.contact-card h3` 1.6rem; `.branch h3` `clamp(1.75rem, 1.5rem + 1vw, 2.25rem)`; `.treatment h3` `clamp(1.6rem, 1.4rem + .6vw, 2rem)`; `.emergency h3` 1.9rem; `.stat-value` `clamp(2.5rem, 2rem + 2vw, 3.5rem)`; `.rating-value` 4.5rem; `.brand-name` 1.3rem with `small` .72rem; `.svc-hero .lead` `clamp(1.125rem, 1rem + .5vw, 1.375rem)`; FAQ question 1.0625rem.

### Spacing, layout, radii, borders, shadows

| Token | Value | Use |
|---|---|---|
| `--gutter` | `clamp(16px, 4vw, 40px)` | Side padding |
| `--max` | `1240px` | Content width (`.wrap` max = 1240 + 2 × gutter) |
| `--section-y` | `clamp(72px, 9vw, 136px)` | Section vertical padding |
| Section head margin | `clamp(40px, 5vw, 72px)` | Hard-coded |
| `--r-lg` | 18px | Cards, panels, photo frames |
| `--r-md` | 10px | Gallery tiles, doctor photo, draft banner |
| `--r-sm` | 6px | Inputs, logo placeholder, skip link |
| Hard-coded radii | 999px (buttons, chips, tabs, icon buttons), 14px (problem icon tile), 9px (brand mark), 4px (focus outline), 50% (discs, accent) | |
| Borders | 1px solid `--line` on cards; 1px dashed for placeholders (`.is-placeholder`, avatar, logo, brand mark, socials) | |
| Shadows | Only `.problem::after` (`0 1px 2px` + `0 12px 32px -12px`, ink at .04/.16), faded in on hover. No other shadows. | |

Spacing values inside components are hard-coded px (gaps 8–64px, paddings 16–36px); there's no spacing scale token.

### Breakpoints (all hard-coded)

| Width | Effect |
|---|---|
| ≤480 | Stats stack; doctor photo 3:2 |
| ≥480 | Doctor card two columns (180px photo, 4:5) |
| ≥560 | Header "Call" button shows |
| ≥640 | Form two columns; carousel two slides; lightbox prev/next move to middle (below 640 they sit at the bottom) |
| ≥720 | Doctor grid two columns |
| ≥760 | Service tray becomes a grid (3+3 columns of 6); masonry three columns; why-row and cause-list two columns |
| ≥860 | Branch grid two columns; steps three columns |
| ≥900 | Section head 7fr/5fr split; about 5fr/6fr; FAQ 4fr/7fr with sticky head; service hero 7fr/5fr; treatment three columns; footer four columns; call bar hidden |
| ≥1000 | Reviews 340px and fluid; contact 7fr/5fr |
| ≥1024 | Tray 3 on top, 2 below |
| ≥1100 | Desktop nav shows; menu button hidden |
| ≥1300 | Carousel three slides |

---

## Logo and imagery

| Asset | Where | Size | Status |
|---|---|---|---|
| Logo | Header `.brand-mark` (36×36, dashed, text "Logo"); footer `.logo-ph` (140×56, "Logo to be supplied") | Fixed px | **Placeholder. Brand-specific.** Clear-space and size rules aren't defined. |
| Brand wordmark | Header: "Sree Mithra" + small "Dental & Maxface Specialists", **hard-coded in `partials.mjs` line 105**, not read from `SITE` | 1.3rem / .72rem | **Brand-specific, hard-coded** |
| Favicon | None | – | Missing |
| Hero image | None (stand-in hero is text only) | – | Hero not supplied |
| About photo | `figure.photo-ph.about-photo`, 4:5, parallax inner layer; caption "Suggested: the Tanuku treatment room in daylight" | Fluid | Placeholder. The caption is brand-specific. |
| Doctor photos | `.doctor .photo-ph` (180px wide, 4:5; 3:2 on mobile) | | Placeholder |
| Gallery | Nine `.g-item` buttons in four aspect ratios: `ar-tall` 3:4, `ar-wide` 4:3, `ar-sq` 1:1, `ar-pano` 16:10 | Masonry columns | Placeholders with labels: Reception, Treatment room, Dental chair, Sterilisation area, Doctors at work, Waiting area, Digital X-ray unit, Front desk team, Clinic entrance |
| Map previews | `.map-ph` 16:7 inline SVG of abstract roads; red pin only when the branch is confirmed | | Placeholder |
| Reviewer avatars | `.avatar-ph` 40px dashed circle | | Placeholder |
| Service marks | Five inline SVG symbols `m-crown`, `m-veneer`, `m-implant`, `m-face`, `m-jaw`: silver gradient fill, brushed pattern, red rim stroke | 84px on cards; poster at 18% padding inside a 420px accent | Generic (not brand-specific), but the colours are hard-coded |
| Problem icons | 25 stroke symbols (`p-*`) at 24px in a 48px tile | | Generic |
| UI icons | phone, pin, clock, route, left, right, close, menu, pause, play, image, person, star, star outline | | Generic |
| 3D accents | `accent3d.js`, procedural (no model files) | ≤420px square canvas, DPR capped at 2 | Generic. Red rim light is hard-coded. |
| Parallax drawing | `archLayer()`: nine U-curves and 14 circles (a dental arch), 600×420 viewBox | `min(760px, 120vw)` | Generic |

Alt-text pattern: no `<img>` exists. Decorative SVGs are `aria-hidden="true" focusable="false"`. Placeholders use `role="img"` with an `aria-label` (map, logo) or a visible figcaption (about photo). Gallery buttons use `aria-label="Open {label} placeholder"`.

---

## Motion catalogue

Easing token: `--ease-out: cubic-bezier(.2, .7, .2, 1)`. A separate view-transition easing, `cubic-bezier(.3, .7, .2, 1)`, is hard-coded. There are no duration tokens; every duration below is hard-coded.

| # | Effect | Trigger | Properties | Duration and easing | Reduced motion |
|---|---|---|---|---|---|
| 1 | Scroll reveal (headings, intros, photo, rating, form, emergency) | IntersectionObserver, threshold .08, rootMargin bottom -8%; `.motion` class added only when motion is allowed | opacity 0→1, `translate3d(0,22px,0)`→none | .8s `--ease-out` | No `.motion` class, so content shows immediately |
| 2 | Stagger (children of `[data-stagger]`: tray, stats, doctor grids, branch grid, contact cards, problem grid, why list, causes, treatments, steps) | Same observer | Same as 1 | .8s, delay `i × 70ms`; `reveal` classes removed 1400ms after entry, so tilt can take over | Off |
| 3 | Parallax: arch behind Services head (speed .4), behind Gallery head (.3), about photo inner (.12) | Scroll, rAF-throttled; only while visible (IO, rootMargin 20%) | `translate3d(0, var(--py), 0)`; `--py = progress × speed × 100px`, where progress = (element centre − viewport centre) / viewport height | Continuous | JS skipped; CSS forces `transform: none` |
| 4 | Service card 3D tilt | pointermove, `(hover:hover) and (pointer:fine)` only | `rotateX` ±4deg, `rotateY` ±5deg | .5s `--ease-out`; resets on leave | Off |
| 5 | Service card red glow | hover / focus-within | Opacity of a radial gradient that follows the cursor (`--gx/--gy`) | .35s linear | Instant (global .01ms) |
| 6 | Service card border tint | hover | **border-color** (not transform/opacity) | .3s | Instant |
| 7 | Magnetic buttons (`[data-magnetic]`: directions, submit, Talk to a specialist) | pointermove, fine pointer | `translate(--bx,--by)`, x = offset × .22, y = offset × .3 | .35s `--ease-out` | Off |
| 8 | Button colours | hover | **background-color, border-color, color** | .2s | Instant |
| 9 | Link underline | hover | background-image/size (no transition) | Instant | – |
| 10 | Counters | IO threshold .6; **only when `data-confirmed="true"`** | textContent | 1400ms easeOutCubic, `en-IN` formatting | Jumps to final value. Currently all three are unconfirmed, so they show "—". |
| 11 | FAQ panel open | click | `@keyframes panelIn`: opacity 0→1, translateY(-6px)→0 | .35s `--ease-out` | Instant |
| 12 | FAQ plus→minus | `aria-expanded` | Vertical bar rotate 90→0deg; disc **background-color/border-color** to red | .3s `--ease-out`; colours .2s | Instant |
| 13 | Gallery tile hover | hover | `scale(.985)` | .5s `--ease-out` | Instant |
| 14 | Lightbox open/close | click; Esc, close button or backdrop | Overlay opacity 0→1 (.3s); figure `scale(.94)`→1 (.45s `--ease-out`) and opacity (.35s); hidden 300ms after close | – | `hidden` toggles with no delay |
| 15 | Lightbox swipe | touchend, \|dx\| > 50px and \|dx\| > \|dy\| | Content swap (no animation) | – | Same |
| 16 | Review carousel | Buttons, native scroll-snap, mouse drag | Scroll position (`scroll-behavior: smooth`) | Auto-advance every 6000ms; momentum `v ×= .94` per frame, stop below .5 | Auto-advance off, pause button hidden, no glide |
| 17 | Carousel pause | Hover, focus inside, off screen (IO .4), tab hidden, or pause button | – | – | – |
| 18 | Mobile call bar | scrollY > 320 | `translateY(110%)`→0 | .35s `--ease-out` | Instant |
| 19 | Problem card lift | hover, `(hover:hover)` only | `translateY(-4px)` .6s `--ease-out`; shadow layer opacity .6s; **border-color** .4s; icon tile **background-color/color** .4s | – | Instant |
| 20 | Service page morph | Cross-document View Transition (Chromium only); card `.svc-icon` and header `.accent` share `view-transition-name: accent-{slug}` | Browser-generated group transform/opacity | .55s `cubic-bezier(.3,.7,.2,1)` | `@view-transition { navigation: none }` |
| 21 | 3D accent load | IO on `.accent`, then `requestIdleCallback` (fallback 200ms), then dynamic import of three.js | Canvas opacity 0→1 (.8s); SVG poster 1→0 (.6s) | – | Loads, then renders a single still frame |
| 22 | 3D settle-in turn | On mount | Pivot rotation y from −1.4 rad to 0 (target base −.5 + .5), lerp .07 per frame, stops below .0008 | One-off, then stops | Starts at the target; no turn |
| 23 | 3D pointer and scroll response | window pointermove and scroll | rotation y = ±.4 rad across the viewport width; x = ±.175 rad and up to +.5 rad over the first 900px of scroll | Same lerp; renders only while easing, visible and the tab is shown | No listeners |
| 24 | Global smooth anchor scroll | Anchor clicks | `scroll-behavior: smooth`, `scroll-padding-top: 80px` | – | `auto` |

Looping animation: **none.** No idle loops; the 3D renders only on demand.

Rule deviations: items 6, 8, 12, 19 (and field focus colours) transition **colour properties**, not only transform and opacity. These are paint-only and cheap, but strictly outside the "transform and opacity only" rule. The carousel animates scroll position, not CSS.

---

## Interactions

| Interaction | Behaviour |
|---|---|
| Skip link | First focusable element, off screen until focused, targets `#main` |
| Sticky header | `position: sticky`, 92% Ink with backdrop blur, 68px tall |
| Desktop nav (≥1100) | Eight anchor links. Scroll-spy (IO, rootMargin −45%/−50%) sets `aria-current="true"`, shown as a 2px red underline. On service pages the links point to `../../#id`. |
| Mobile nav (<1100) | 44px menu button with `aria-expanded`/`aria-controls`; a two-column grid of links; closes on link click or Esc (returns focus). **Without JS the menu can't open.** The footer links are the fallback. |
| Header call | "Call Tanuku" `tel:` link, ≥560px |
| Service cards | The whole card is clickable via `.link::after` overlay; focus ring drawn on the card via `:has(.link:focus-visible)` |
| Book with this doctor | Links to `#contact`; JS sets the branch select and, if empty, fills the message with "I would like to book with {name}." Placeholder doctors get a disabled `aria-disabled` span. |
| Branch buttons | "Get directions" (Google Maps directions URL, new tab, visually hidden "(opens Google Maps)"); "Call {branch}". Unconfirmed branch: disabled "Directions to be added". |
| Gallery tabs | `role="tablist"`/`tab`, `aria-selected`, roving tabindex, ←/→ keys; filters `li[data-cat]` with `hidden` |
| Lightbox | `role="dialog" aria-modal="true"`; opens on tile click; focus goes to Close; Tab is trapped; ←/→ navigate; Esc closes; backdrop click closes; swipe on touch; "n of N" live region; focus returns to the tile |
| Review carousel | Focusable scroll track (`tabindex="0"`), `aria-roledescription` carousel/slide, prev/next 48px buttons, pause toggle (`aria-pressed`, label swap), "n of 6" live status, mouse drag with momentum |
| Rating summary | Value (placeholder "–.–"), five outline stars, text, "Read all reviews on Google" (Maps search URL, new tab). **No breakdown, no tooltip.** |
| Appointment form | One step. Fields: name\*, phone\* (`tel`), service\* (five services + "Not sure yet"), preferred branch\*, preferred date (optional, native date input), message (optional). `novalidate` set by JS. Checks: name ≥2 chars; phone `/^[+\d][\d\s-]{8,15}$/`; service and branch chosen. Errors appear on blur (if filled) and on submit; the first invalid field gets focus; `aria-invalid` is set; error text is in `aria-live` spans. A valid submit **sends nothing** and shows: "Online booking is not connected yet, so this request has not been sent. To book now, call the Tanuku branch on 088192 20055." (focused `role="status"`). **No honeypot, slots, dates window, Sunday rules or network states.** |
| FAQ accordion | `<h3><button aria-expanded aria-controls>` and `role="region" aria-labelledby` panel; panels are hidden by JS only, so they're all open without JS |
| Phone links | `tel:+918819220055` (header, branch, contact cards, footer, call bar, FAQ, service hero, Talk section) |
| Map links | Directions URL (branch card), "Open in Google Maps" (contact card), same URL |
| Breadcrumb | Home / Services / {name}, `aria-current="page"` |
| Other services | Pill links to the other four services at the end of each service page |

---

## Content inventory

Everything below is specific to this clinic and must be replaced for a new one. "HC" means hard-coded in a component, not read from `data.mjs`.

### Name and branding
| Text | Location |
|---|---|
| "Sree Mithra Dental & Maxface Specialists" | `SITE.name` → titles, meta descriptions, header `aria-label`, footer copyright, stand-in H1 |
| "Sree Mithra" | `SITE.short` (unused) and **HC** in header `partials.mjs:105` |
| "Dental & Maxface Specialists" | **HC** header small text |
| Tagline "Specialist care for teeth, jaw and face, under one roof." | `SITE.tagline` → hero stand-in, footer |
| `<title>` "… \| Tanuku and Tadepalligudem" and meta description listing the services | **HC** `landing.mjs:266` |
| Service-page meta "…, Tanuku and Tadepalligudem." | **HC** `service-template.mjs:22` |
| Stand-in hero chip "Stand-in only: replace with the approved hero" | **HC** |
| "Designed by [studio credit, to be confirmed]" | **HC** footer |

### Section copy (all HC in `landing.mjs`)
- **Services:** "What we treat" / "Five specialities, one team" / "From a routine filling to jaw surgery, your care stays with the same clinic and the same records." / "Swipe to see all five"
- **About:** "Teeth, jaw and face, treated as one" plus two paragraphs (mention "an oral and maxillofacial surgeon" and "both branches")
- **Stats labels** (`SITE.stats`): Years of practice, Patients treated, Procedures performed. All values `null`.
- **Doctors:** "Consultants and doctors" / "The people you will see" / intro
- **Branches:** "Branches" / "Two clinics in West Godavari" / "Visit whichever is closer. Your records can be shared between branches."
- **Gallery:** "Gallery" / "Inside the clinic" / intro; nine labels and categories (`GALLERY` array)
- **Reviews:** "Google reviews" / "What patients say" / intro; six placeholder review texts
- **Contact:** "Contact" / "Request an appointment" / intro; form labels; message placeholder "For example: pain in a lower back tooth for three days"; note "We will call to confirm a time…"
- **FAQ:** "FAQ" / "Before you visit"; seven Q&As (booking mentions the Tanuku phone; one mentions "the maxillofacial surgeon")

### Services (`SERVICES`)
| slug | name | 3D kind | summary |
|---|---|---|---|
| dental | Dental | crown | Check-ups, fillings, root canals and extractions for teeth and gums. |
| cosmetology | Cosmetology | veneer | Whitening, veneers and smile design for colour, shape and spacing. |
| implants | Implants | implant | Fixed replacements for missing teeth, anchored in the jaw. |
| facial-trauma | Facial Trauma | face | Assessment and repair of injuries to the face, jaw and teeth. |
| maxillofacial | Maxillofacial | jaw | Surgery for the jaws, jaw joints and soft tissues of the mouth. |

Service page content (`services-content.mjs`, all draft pending doctor review):

| Service | Problems (icons) | Causes | Treatments | FAQ | Extra |
|---|---|---|---|---|---|
| dental | 7 (ache, cold, gum, cavity, wisdom, root, extract) | 7 | 6 | 4 | – |
| cosmetology | 4 (stain, chip, gap, smile) | 7 | 5 | 4 | – |
| implants | 4 (missing, bone, denture, check) | 6 | 5 | 4 | – |
| facial-trauma | 4 (face, fracture, knock, cheek) | 5 | 5 | 4 | Emergency first steps (5 steps) |
| maxillofacial | 6 (joint, align, wisdom, swell, cyst, lesion) | 7 | 6 | 4 | – |

Template copy that's HC: "What patients notice", "Why they happen", "Common causes", "Treatment options", "What to expect" (Consultation, Procedure, Follow-up), "{Service} questions", "Book a {service} consultation", the draft banner text ("…for the clinic's dentists to check…"), and the "Call Tanuku" button.

### Doctors (`DOCTORS`)
| Branch | Name | Degree | Specialty | Bio |
|---|---|---|---|---|
| tanuku | Dr. G. Sriramu Subbareddy (note: board shows "Dr. S.R.S. Reddy") | M.D.S (OMFS) | Oral and maxillofacial surgery | null |
| tanuku | Dr. G.V.N. Lakshmi | B.D.S | General dentistry (to be confirmed) | null |
| tadepalligudem | null × 2 | – | – | – |

### Branches (`BRANCHES`)
| Field | Tanuku | Tadepalligudem |
|---|---|---|
| Address | Sree Satya Plaza, Velpur Rd / Opposite Masjid Complex, Venkatarayapuram / Tanuku 534211 | null |
| Phone / tel | 088192 20055 / +918819220055 | null |
| Hours | Mon to Sat 9 am to 8 pm; Sunday 9 am to 5 pm | null |
| Directions | Google Maps `dir` URL to the address | null |

Also HC: "Call Tanuku" (header, Talk section), "Call now: Tanuku …" (call bar, uses `BRANCHES[0]`), the Tanuku phone inside the form status message (`site.js:316`), and the about caption.

### Google
`SITE.googleListing` (Maps search URL, to be confirmed), `rating: null`, `reviewCount: null`. Reviews: none real.

### Not present
Email, WhatsApp, social URLs, legal pages (privacy, terms), Telugu text.

---

## Backend

**There is no backend.**

| Item | Value |
|---|---|
| Booking endpoint | None. `<form action="#" method="post">`; JS `preventDefault`s every submit. |
| Apps Script / API | None |
| Google Sheet | None |
| Environment variables | None |
| Config constants | `build/data.mjs` (`SITE`, `BRANCHES`, `SERVICES`, `DOCTORS`) and `build/services-content.mjs` (`CONTENT`) |
| `TODO(client)` markers | `data.mjs` (Google URL, rating, count, stats, Tadepalligudem), `landing.mjs` form comment, `site.js:314` (submission destination) |

Values that must change for a new clinic even without a backend: everything in `data.mjs` and `services-content.mjs`, the HC strings listed above, and the HC phone in `site.js:316`.

---

## Accessibility and performance

### Contrast (checked with a WCAG formula script last session)
| Pair | Ratio | Min |
|---|---|---|
| Ink on Pearl / Mist / white | 16.61 / 15.17 / 17.96 | 4.5 |
| Slate on Pearl / Mist / white / Blush | 5.69 / 5.19 / 6.15 / 5.26 | 4.5 |
| Ink on Blush (chips) | 15.37 | 4.5 |
| Pearl on Ink / Graphite | 16.61 / 14.59 | 4.5 |
| Silver on Ink / Graphite | 9.69 / 8.52 | 4.5 |
| White on Red / Red hover | 5.88 / 8.31 | 4.5 |
| Gold stars on Graphite | 6.89 | 3 (graphic) |
| Red focus ring on Pearl; Pearl ring on Ink | 5.44; 16.61 | 3 |
| Field border `#8A929E` on white | 3.14 | 3 |

Not checked: decorative `--line` hairlines (`#D5DAE1` on Pearl is under 3:1; they're decorative, but card edges rely on them), and the red eyebrow tick.

### Other
- Focus: `:focus-visible` 2px outline in `--focus` (red on light, pearl on dark), offset 3px. Inputs use a 2px red outline at offset 0. Service cards draw the ring on the card.
- One H1 per page; landmarks: header, nav (labelled Main, Main mobile, Breadcrumb, Sections, Services, Other services), main, footer; each section uses `aria-labelledby`.
- Touch targets: minimum 44px (buttons 48, icon buttons 48, nav 44, inline phone links get 44px via negative margin).
- Placeholders are visible text chips, not colour alone.
- No-JS: all text is in the HTML; FAQ is expanded; no reveals; call bar visible.
- Fonts: two Google families, preconnect plus a render-blocking stylesheet with `display=swap`.
- JS: `site.js` is deferred (about 16 KB). Three.js r160 loads from jsDelivr only on service pages, when the accent is visible and the browser is idle: about 167 KB br (671 KB raw), plus a 13 KB module. Under the 1 MB budget.
- Images: none, so there's nothing to lazy-load yet. When photos arrive they need `loading="lazy"`, `width`/`height` and descriptive alt text.

### Known issues from the last session
1. The hero isn't supplied; the stand-in holds the H1.
2. No favicon.
3. The mobile menu needs JS.
4. Hover lift on the problem cards was checked only in a static screenshot, not live.
5. The cross-document morph works only in Chromium browsers.
6. The 4× CPU frame-rate test hasn't been run.
7. The reduced-motion path is written but wasn't tested with the OS setting on.
8. The form isn't wired.
9. Colour transitions are outside the transform/opacity rule (see the motion catalogue).
10. External runtime dependencies: Google Fonts and jsDelivr.
11. The user also reported a different version of the site (heavy sans headings, lightning-bolt icons, copy "Signs that it may be time to see a specialist"). That version isn't in this folder and wasn't analysed.

---

## Build and deploy

| Item | Value |
|---|---|
| Framework | None. Plain HTML, CSS and JS generated by Node ESM template-literal functions. No dependencies. |
| Node | 18+ (developed on v24) |
| Build | `npm run build` → `node build/build.mjs` → writes `index.html` and `services/<slug>/index.html` |
| Preview | `npm start` → `node build/serve.mjs` → http://localhost:4173 (`PORT` env overrides); `.claude/launch.json` config named `site` |
| Routing | Folder routes (`/services/dental/`). Needs a host that serves `index.html` for folders. Opening from `file://` breaks folder links. |
| Hosting | Not configured. Any static host works (Netlify, Vercel static, GitHub Pages, S3, cPanel). |
| Deploy artefacts | `index.html`, `services/`, `assets/`. `build/` is source only. |
| Git | The folder isn't a git repository. |

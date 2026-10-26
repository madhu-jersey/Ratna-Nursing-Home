# Ratna Nursing Home, Tanuku: website

A static site with no dependencies. It needs Node 18 or later to build.

```
npm run build    # writes index.html and services/<slug>/index.html
npm start        # preview at http://localhost:4173
```

## Structure
- `build/data.mjs`: hospital name, address, phones, emergency, departments, doctors, facilities and the PC-PNDT notice. Unconfirmed values are `null`.
- `build/services-content.mjs`: draft medical copy for the five department pages. `[text]` renders as a placeholder chip.
- `build/landing.mjs`: the animated hero (headline rising line by line, live 3D mother-and-child accent, floating cards, pulse line, cursor spotlight), the department marquee, and the nine landing sections.
- `build/service-template.mjs`: the one template used for all department pages.
- `build/partials.mjs`: header, footer, address cards, icon sprite, silver department marks and the PC-PNDT note.
- `assets/css/site.css`: tokens and all styles. The palette is Navy `#16324B` and Butter `#F3EDDD`: navy on butter for light sections, butter on navy for dark ones (the accent token is still named `--red` so the rest of the file is unchanged).
- `assets/js/site.js`: progressive interactions (word-by-word heading reveals, card reveals, hero spotlight and card depth, tilt, magnetic buttons, parallax, gallery, lightbox, carousel, FAQ, form). With reduced motion turned on in the OS, everything appears at once and nothing loops.
- `assets/js/accent3d.js`: procedural three.js accents (stethoscope, mother and child, ultrasound probe, cell, laparoscope, and a cross as the fallback). They're lazy-loaded on department pages only.

Edit the files in `build/`, not the generated HTML. The build deletes and rewrites `services/` every time.

## Notes
- Routes are folders (`/services/general-medicine/`), so any static host serves them. Use `npm start` to preview, because opening the files from disk breaks the folder links.
- Deploy `index.html`, `services/` and `assets/`. The `.md` files and `build/` aren't part of the site.
- Contrast: every text and colour pair passes WCAG AA with the navy and butter palette.
- See `PLACEHOLDERS.md` for everything the hospital still needs to supply, and `HOSPITAL-DETAILS.md` for the form used to collect it.
- `_source-reference/` holds the analysis and master prompt of the dental site this was converted from. It's for reference only.

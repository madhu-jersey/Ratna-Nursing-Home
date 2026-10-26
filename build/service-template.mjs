// The one reusable department detail template. build.mjs renders it once per department.
import { SITE, BRANCHES, PRIMARY, SERVICES, EMERGENCY } from './data.mjs';
import { esc, tbc, icon, sprite, header, footer, head, contactCard, callBar, serviceMark, callLabel, pcpndtNote } from './partials.mjs';
import { accordion } from './landing.mjs';

const R = '../../';
const DRAFT = 'Draft, pending doctor review';
// "[note]" inside content becomes a labelled placeholder chip
const rich = s => esc(s).replace(/\[(.+?)\]/g, (_, t) => tbc(t, 'tbc-inline'));

const sectionHead = (id, title, intro, eyebrow) => `<div class="section-head">
  <div class="reveal">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h2 id="${id}">${title}</h2></div>
  <div class="reveal">${intro ? `<p class="intro">${intro}</p>` : ''}<p style="margin:${intro ? '14px' : '0'} 0 0"><span class="draft-label">${DRAFT}</span></p></div>
</div>`;

export const servicePage = (svc, c) => {
  const others = SERVICES.filter(s => s.slug !== svc.slug);
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
${head({ title: `${svc.name} | ${SITE.name}`, description: `${c.lead} ${SITE.name}, ${SITE.town}.`, R })}
</head>
<body>
${sprite()}
${header(R)}
<main id="main">

<!-- 1. Page header -->
<section class="section theme-dark svc-hero" aria-labelledby="page-title">
  <div class="wrap svc-hero-grid">
    <div>
      <nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="${R}">Home</a></li><li><a href="${R}#services">Departments</a></li><li><span aria-current="page">${esc(svc.name)}</span></li></ol></nav>
      <h1 id="page-title">${esc(svc.name)}</h1>
      <p class="lead">${esc(c.lead)}</p>
      <p><span class="draft-label">${DRAFT}</span></p>
      <div class="btn-row">
        <a class="btn btn-primary" data-magnetic href="#talk">Talk to a doctor</a>
        <a class="btn btn-ghost" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>Call ${PRIMARY.phone}</span></a>
      </div>
    </div>
    <div class="accent" data-kind="${svc.kind}" style="view-transition-name: accent-${svc.slug}" aria-hidden="true">
      ${serviceMark(svc.kind, 'accent-poster')}
    </div>
  </div>
</section>

<!-- 2. Common problems -->
<section class="section" aria-labelledby="problems-title">
  <div class="wrap">
    <div class="draft-banner" role="note"><p><strong>${DRAFT}.</strong> The medical information on this page is a starting draft written for the hospital's doctors to check and correct. It is not a diagnosis. Please see a doctor about your symptoms.</p></div>
    ${svc.pcpndt ? `<div class="legal-band reveal">${pcpndtNote()}</div>` : ''}
    ${sectionHead('problems-title', svc.slug === 'ultrasound' ? 'Why a scan is needed' : 'What patients notice', svc.slug === 'ultrasound' ? 'The usual reasons a doctor asks for an ultrasound.' : 'Common reasons people come to this department.', 'Common problems')}
    <ul class="problem-grid" role="list" data-stagger>
      ${c.problems.map(p => `<li class="problem"><span class="p-icon">${icon(p.icon)}</span><h3>${esc(p.title)}</h3><p>${rich(p.notice)}</p></li>`).join('')}
    </ul>
    ${c.emergency ? `<div class="emergency reveal" role="note" aria-labelledby="first-steps">
      <div><h3 id="first-steps">${esc(c.emergency.title)}</h3>${EMERGENCY.available24h ? `<p class="note" style="margin-top:12px"><strong>Our emergency department is open 24 hours, every day.</strong>${EMERGENCY.tel ? ` Call <a href="tel:${EMERGENCY.tel}">${EMERGENCY.phone}</a>.` : ''}</p>` : ''}${c.emergency.note ? `<p class="note"${EMERGENCY.available24h ? '' : ' style="margin-top:12px"'}>${tbc(c.emergency.note)}</p>` : ''}<p class="note">${DRAFT}</p></div>
      <ol>${c.emergency.steps.map(s => `<li>${rich(s)}</li>`).join('')}</ol>
    </div>` : ''}
  </div>
</section>

<!-- 3. Why they occur -->
<section class="section theme-mist" aria-labelledby="why-title">
  <div class="wrap">
    ${sectionHead('why-title', 'Why they happen', 'A short explanation for each problem above.')}
    <dl class="why-list" data-stagger>
      ${c.problems.map(p => `<div class="why-row"><dt>${esc(p.title)}</dt><dd>${rich(p.why)}</dd></div>`).join('')}
    </dl>
  </div>
</section>

<!-- 4. Causes -->
<section class="section" aria-labelledby="causes-title">
  <div class="wrap">
    ${sectionHead('causes-title', 'Common causes', 'Things that make these problems more likely.')}
    <ul class="cause-list" data-stagger>${c.causes.map(x => `<li>${rich(x)}</li>`).join('')}</ul>
  </div>
</section>

<!-- 5. Treatment options -->
<section class="section theme-dark" aria-labelledby="treat-title">
  <div class="wrap">
    ${sectionHead('treat-title', 'Treatment options', 'What each option involves and what recovery usually looks like. Your doctor will advise which suits you.', 'Solutions')}
    <ul class="treatments" role="list" data-stagger>
      ${c.treatments.map(t => `<li class="treatment">
        <h3>${esc(t.name)}</h3>
        <div><h4>What it involves</h4><p>${rich(t.involves)}</p></div>
        <div><h4>Recovery</h4><p>${rich(t.recovery)}</p>${t.tbc ? tbc(t.tbc) : ''}</div>
      </li>`).join('')}
    </ul>
  </div>
</section>

<!-- 6. What to expect -->
<section class="section" aria-labelledby="expect-title">
  <div class="wrap">
    ${sectionHead('expect-title', 'What to expect', 'Three stages, from your first visit to aftercare.')}
    <ol class="steps" data-stagger>
      ${['Consultation', 'Procedure', 'Follow-up'].map((h, i) => `<li class="step"><h3>${h}</h3><p>${rich(c.expect[i])}</p></li>`).join('')}
    </ol>
  </div>
</section>

<!-- 7. FAQ -->
<section class="section theme-mist" aria-labelledby="sfaq-title">
  <div class="wrap faq-grid">
    ${sectionHead('sfaq-title', `${svc.name} questions`, null, 'FAQ')}
    ${accordion(c.faq.map(([q, a]) => [q, `<p>${rich(a)}</p>`]), 'sfaq')}
  </div>
</section>

<!-- 8. Talk to a specialist -->
<section id="talk" class="section theme-dark theme-graphite" aria-labelledby="talk-title">
  <div class="wrap">
    <div class="cta-band">
      <div class="reveal"><p class="eyebrow">Talk to a doctor</p><h2 id="talk-title">Book an appointment in ${esc(svc.name)}</h2></div>
      <div class="reveal"><p class="muted">Call reception, or send a request and we will call you back to confirm a time.</p>
        <div class="btn-row"><a class="btn btn-primary" data-magnetic href="${R}#contact">Request an appointment</a><a class="btn btn-ghost" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>${callLabel()}</span></a></div>
      </div>
    </div>
    <div class="branch-grid${BRANCHES.length === 1 ? ' is-single' : ''}" data-stagger>${BRANCHES.map(contactCard).join('')}</div>
    <nav class="svc-other" aria-label="Other departments">${others.map(s => `<a href="${R}services/${s.slug}/">${esc(s.name)}</a>`).join('')}</nav>
  </div>
</section>

</main>
${footer(R)}
${callBar()}
</body>
</html>
`;
};

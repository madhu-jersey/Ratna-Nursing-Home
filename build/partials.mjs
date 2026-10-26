import { SITE, BRANCHES, PRIMARY, SERVICES, LEGAL, EMERGENCY } from './data.mjs';

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const tbc = (text = 'To be confirmed with client', cls = '') => `<span class="tbc ${cls}">${esc(text)}</span>`;
export const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

const sym = (id, body, vb = '0 0 24 24') =>
  `<symbol id="${id}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`;

/* Inline SVG sprite: UI icons, problem icons and the flat department marks */
export const sprite = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
${sym('i-phone', '<path d="M5 3.5h3.2l1.6 4.2-2 1.3a11 11 0 0 0 7.2 7.2l1.3-2 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5z"/>')}
${sym('i-mobile', '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10.5 18.5h3"/>')}
${sym('i-pin', '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>')}
${sym('i-clock', '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>')}
${sym('i-route', '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>')}
${sym('i-left', '<path d="M14.5 6 8.5 12l6 6"/>')}
${sym('i-right', '<path d="M9.5 6l6 6-6 6"/>')}
${sym('i-arrow', '<path d="M5 12h14M13 6l6 6-6 6"/>')}
${sym('i-close', '<path d="M6 6l12 12M18 6 6 18"/>')}
${sym('i-menu', '<path d="M4 8h16M4 16h16"/>')}
${sym('i-pause', '<path d="M9 6v12M15 6v12"/>')}
${sym('i-play', '<path d="M8 5.5v13l10-6.5z"/>')}
${sym('i-image', '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4"/>')}
${sym('i-person', '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>')}
<symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z"/></symbol>
<symbol id="i-star-o" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8z"/></symbol>
${sym('p-fever', '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a3.5 3.5 0 1 1-4 0z"/><path d="M12 9v7"/><path d="M17 6h2M17 9.5h2"/>')}
${sym('p-sugar', '<path d="M12 3.5s-6 6.6-6 10.7a6 6 0 0 0 12 0C18 10.1 12 3.5 12 3.5z"/><path d="M9.5 14.5h5M12 12v5"/>')}
${sym('p-thyroid', '<path d="M12 8c-1.6-3-6.5-3.6-7.5-.5-.8 2.6.6 6 3.6 7.2 1.8.7 3.2-.2 3.9-1.7.7 1.5 2.1 2.4 3.9 1.7 3-1.2 4.4-4.6 3.6-7.2-1-3.1-5.9-2.5-7.5.5z"/><path d="M12 8v9"/>')}
${sym('p-bp', '<path d="M4 16a8 8 0 1 1 16 0"/><path d="m12 16 4-5"/><circle cx="12" cy="16" r="1.2"/><path d="M4 20h16"/>')}
${sym('p-lungs', '<path d="M12 4v8"/><path d="M12 10c-1.5 0-2.5-1.2-3.5-2.6C7.2 5.6 4 7 4 11v5.5c0 2 1.6 3 3.3 2.5 2.7-.8 4.7-2.8 4.7-6"/><path d="M12 10c1.5 0 2.5-1.2 3.5-2.6C16.8 5.6 20 7 20 11v5.5c0 2-1.6 3-3.3 2.5-2.7-.8-4.7-2.8-4.7-6"/>')}
${sym('p-kidney', '<path d="M9 4C5.5 4 4 7.5 4 11.5S5.5 20 9 20c2.6 0 3.6-2 3-4-.4-1.4-1.5-2.2-1.5-4s1.1-2.6 1.5-4c.6-2-.4-4-3-4z"/><path d="M12 12h4c2 0 3 1.2 3 3v5"/>')}
${sym('p-heart', '<path d="M12 19.5s-7.5-4.4-7.5-9.8A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.3c0 5.4-7.5 9.8-7.5 9.8z"/><path d="M5 12.5h3.5l1.5-2.5 2 4.5 1.5-2h5.5"/>')}
${sym('p-pregnant', '<circle cx="11" cy="4.8" r="2"/><path d="M10 8.5c-1.6.6-2.4 2.3-2.4 4.4V21"/><path d="M11.5 8.5c.6 1.6 1 2.4 2.6 3.2 2.4 1.2 2.4 4.6 0 5.6-1 .4-2.1.4-3.1.1V21"/>')}
${sym('p-monitor', '<rect x="3" y="4.5" width="18" height="13" rx="2"/><path d="M5.5 11h2.5l1.5-3 2.5 6 2-4.5 1 1.5h3.5"/><path d="M9 20.5h6"/>')}
${sym('p-calendar', '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="M12 12.6c-.9 1.2-1.4 2-1.4 2.7a1.4 1.4 0 0 0 2.8 0c0-.7-.5-1.5-1.4-2.7z"/>')}
${sym('p-pcod', '<circle cx="12" cy="12" r="7.5"/><circle cx="9" cy="9.5" r="1.4"/><circle cx="14.5" cy="9" r="1.2"/><circle cx="15" cy="14" r="1.5"/><circle cx="9.8" cy="14.8" r="1.1"/>')}
${sym('p-pain', '<circle cx="12" cy="12" r="8.5"/><path d="m7.5 12 2-2.5 2.5 5 2.5-5 2 2.5"/>')}
${sym('p-scan', '<path d="M9 3.5h6l-.8 7h-4.4z"/><path d="M9.8 10.5h4.4v2.5a2.2 2.2 0 0 1-4.4 0z"/><path d="M7 17.5c3 2 7 2 10 0M5 20.5c4 2.4 10 2.4 14 0"/>')}
${sym('p-stomach', '<path d="M9 3.5v4c0 2-3.5 2.5-3.5 7 0 3.6 2.8 6 6.3 6 4.4 0 6.7-3.2 6.7-6.6 0-2.4-1.6-3.6-3.3-3.6-1.4 0-2.2 1-3.2 1S11 9.6 11 7.5v-4"/>')}
${sym('p-couple', '<circle cx="8" cy="7.5" r="2.8"/><circle cx="16.5" cy="8.5" r="2.4"/><path d="M3 20c.5-3.6 2.4-5.6 5-5.6s4.5 2 5 5.6"/><path d="M13.2 14.6c.8-.7 2-1.1 3.3-1.1 2.3 0 4 1.8 4.5 5"/>')}
${sym('p-time', '<path d="M7 3.5h10M7 20.5h10M8 3.5c0 4.4 4 5.2 4 8.5s-4 4.1-4 8.5M16 3.5c0 4.4-4 5.2-4 8.5s4 4.1 4 8.5"/>')}
${sym('p-stone', '<path d="M12 3.5c-3 3.4-5.5 6.6-5.5 10a5.5 5.5 0 0 0 11 0c0-3.4-2.5-6.6-5.5-10z"/><circle cx="10.5" cy="14" r="1.3"/><circle cx="13.6" cy="15.6" r="1"/><circle cx="13" cy="12" r=".8"/>')}
${sym('p-hernia', '<path d="M4 20V9c0-3 2-5 5-5h6c3 0 5 2 5 5v11"/><circle cx="12" cy="15.5" r="3"/>')}
${sym('p-incision', '<path d="M5 19 19 5"/><path d="m8 18-2-2M11 15l-2-2M14 12l-2-2M17 9l-2-2"/>')}
${sym('p-check', '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 3.5h6v2.5H9z"/><path d="m9 13 2.2 2.2 4-4.4"/>')}
${sym('p-alert', '<path d="M12 3.5 21 19.5H3z"/><path d="M12 9.5v4.5M12 16.6v.4"/>')}
${serviceMarkSymbols()}
</svg>`;

/* Flat 2D department marks: solid shapes and thick strokes in currentColor, with fine details in logo red.
   `fill` parts are solid shapes; `line` parts are thick strokes (tubing, waves, rings). */
function serviceMarkSymbols() {
  const mark = (id, { fill = '', line = '', detail = '' }) => `<symbol id="${id}" viewBox="0 0 24 24">
  <g stroke-linejoin="round" stroke-linecap="round">
    <g fill="none" stroke="currentColor" stroke-width="2.2">${line}</g>
    <g fill="currentColor">${fill}</g>
    <g fill="none" stroke="#C8102E" stroke-width="1">${detail}</g>
  </g></symbol>`;
  return [
    mark('m-stethoscope', {
      line: '<path d="M6.5 3.8v5a4.5 4.5 0 0 0 9 0v-5"/><path d="M11 13.3v2.4a4 4 0 0 0 8 0v-1.4"/>',
      fill: '<circle cx="19" cy="12" r="2.7"/><circle cx="6.5" cy="3.2" r="1.2"/><circle cx="15.5" cy="3.2" r="1.2"/>',
      detail: '<circle cx="19" cy="12" r="1.2"/>'
    }),
    mark('m-cradle', {
      fill: '<path d="M12.4 21.5c-5.2 0-8.9-3.9-8.9-8.8 0-4.6 3.2-8.5 7.6-9.2-1.9 1.8-3 4.3-3 7 0 4.6 3.4 8.4 8 8.9-1.1 1.3-2.2 2.1-3.7 2.1z"/><circle cx="14.6" cy="10.6" r="3.2"/>',
      detail: '<path d="M6.4 9.4c-.4 3 .6 6 3.2 8" stroke-opacity=".45"/>'
    }),
    mark('m-scan', {
      fill: '<path d="M8.6 2.5h6.8l-1 8.5H9.6z"/><path d="M9.2 11.5h5.6v2.4a2.8 2.8 0 0 1-5.6 0z"/>',
      line: '<path d="M6.6 18.2c3.2 1.9 7.6 1.9 10.8 0"/><path d="M4.2 21c4.6 2 11 2 15.6 0"/>',
      detail: '<path d="M10.2 5h3.6M10.4 7.4h3.2"/>'
    }),
    mark('m-cell', {
      fill: '<circle cx="11" cy="12.8" r="7.6"/><circle cx="19.2" cy="4.6" r="1.7"/>',
      detail: '<circle cx="11" cy="12.8" r="3"/><path d="M5.6 9.6c.9-1.6 2.4-2.8 4.2-3.3" stroke-opacity=".45"/>'
    }),
    mark('m-scope', {
      fill: '<path d="M2.6 19.8 14.3 8.1l1.6 1.6L4.2 21.4z"/><path d="m13.6 6 4.4 4.4-1.4 1.4-4.4-4.4z"/>',
      line: '<circle cx="18.6" cy="5.4" r="2.4"/>',
      detail: '<path d="M7.2 16.8l1.4 1.4M10 14l1.4 1.4" stroke-opacity=".5"/>'
    }),
    mark('m-cross', {
      fill: '<path d="M9.2 3.5h5.6v5.7h5.7v5.6h-5.7v5.7H9.2v-5.7H3.5V9.2h5.7z"/>',
      detail: '<path d="M10.6 5v5.6" stroke-opacity=".45"/>'
    })
  ].join('\n');
}

export const serviceMark = (kind, cls = '') => {
  const map = { stethoscope: 'm-stethoscope', cradle: 'm-cradle', scan: 'm-scan', cell: 'm-cell', scope: 'm-scope', cross: 'm-cross' };
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#${map[kind] || 'm-cross'}"/></svg>`;
};

/* The hero's dial, reused small: fine ticks around a white face */
export const dial = (cls = '', n = 60) => `<svg class="dial ${cls}" viewBox="0 0 200 200" fill="none" aria-hidden="true">
  <circle class="dial-ring" cx="100" cy="100" r="98"/>
  <g class="dial-ticks">${Array.from({ length: n }, (_, i) => `<line x1="100" y1="${i % 5 ? 5 : 2}" x2="100" y2="${i % 5 ? 11 : 15}" transform="rotate(${i * 360 / n} 100 100)"/>`).join('')}</g>
</svg>`;
export const BEAT = 'M0 20 H150 l8 -12 l9 26 l11 -30 l9 26 l7 -10 H400';

const navItems = [['services', 'Services'], ['about', 'About'], ['doctors', 'Doctors'], ['branches', 'Find us'], ['gallery', 'Gallery'], ['reviews', 'Reviews'], ['contact', 'Contact'], ['faq', 'FAQ']];

export const callLabel = () => BRANCHES.length > 1 ? `Call ${PRIMARY.name}` : 'Call reception';

export const header = (R = '') => `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${R || './'}" aria-label="${esc(SITE.name)}, home">
      <img class="brand-logo" src="${R}assets/img/logo.png" alt="" width="720" height="402">
      <span class="brand-name">${esc(SITE.short)}<small>${esc(SITE.descriptor)}</small></span>
    </a>
    <nav aria-label="Main">
      <ul class="nav-list">${navItems.map(([id, label]) => `<li><a href="${R}#${id}">${label}</a></li>`).join('')}</ul>
    </nav>
    <div class="header-actions">
      <a class="btn btn-quiet header-call" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>${callLabel()}</span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menu">${icon('i-menu')}</button>
    </div>
  </div>
  <nav id="mobile-nav" class="mobile-nav wrap" aria-label="Main, mobile" hidden>
    <ul>${navItems.map(([id, label]) => `<li><a href="${R}#${id}">${label}</a></li>`).join('')}</ul>
  </nav>
</header>`;

const pending = label => `<span class="ph-line">${label} <em>to be confirmed</em></span>`;
const hoursList = b => b.hours
  ? `${b.days ? `<span class="hours-days">${b.days}</span>` : ''}<dl class="hours">${b.hours.map(([d, h]) => `<dt>${d}</dt><dd>${h}</dd>`).join('')}</dl>${EMERGENCY.available24h ? `<span class="hours-days">Emergency: open 24 hours, every day${EMERGENCY.tel ? `, call ${EMERGENCY.phone}` : ''}</span>` : ''}`
  : pending('OPD timings');

export const infoList = b => `<ul class="info-list">
  <li>${icon('i-pin')}<div>${b.addressLines ? `<address style="font-style:normal">${b.addressLines.map(esc).join('<br>')}</address>` : pending('Address')}</div></li>
  <li>${icon('i-phone')}<div>${b.phone ? `<a href="tel:${b.tel}">${b.phone}</a> <span class="muted small">Reception</span>` : pending('Phone')}</div></li>
  ${b.mobiles?.length ? `<li>${icon('i-mobile')}<div>${b.mobiles.map(m => `<a href="tel:${m.tel}">${m.phone}</a>`).join('<span aria-hidden="true">, </span>')} <span class="muted small">Mobile</span></div></li>` : ''}
  <li>${icon('i-clock')}<div>${hoursList(b)}</div></li>
</ul>`;

export const mapPlaceholder = (pin = true) => `<div class="map-ph" role="img" aria-label="Map preview placeholder">
  <svg viewBox="0 0 400 175" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor">
    <path class="map-road" d="M-10 120 C 80 100, 140 140, 230 110 S 360 70, 420 90" stroke-width="10"/>
    <path class="map-road" d="M150 -10 L 175 190" stroke-width="7"/>
    <path d="M-10 40 L 420 60 M 60 -10 L 40 190 M 300 -10 L 330 190 M -10 160 L 420 150" stroke-width="2"/>
    <path d="M220 -10 C 230 60, 250 100, 240 190" stroke-width="2"/>
    ${pin ? '<circle cx="190" cy="98" r="7" style="fill:var(--red)" stroke="none"/><circle cx="190" cy="98" r="16" style="stroke:var(--red)" stroke-opacity=".5"/>' : ''}
  </svg>
  ${tbc('Map preview placeholder')}
</div>`;

/* Large branch card (Find us section) */
export const branchCard = b => `<article class="branch${b.confirmed ? '' : ' is-placeholder'}" aria-labelledby="branch-${b.id}">
  ${mapPlaceholder(b.confirmed)}
  <div class="branch-body">
    <div><h3 id="branch-${b.id}">${esc(b.name)}</h3>${b.confirmed ? '' : `<p style="margin:10px 0 0">${tbc()}</p>`}</div>
    ${infoList(b)}
    <div class="btn-row">
      ${b.directions
        ? `<a class="btn btn-primary" data-magnetic href="${b.directions}" target="_blank" rel="noopener">${icon('i-route')}<span>Get directions<span class="visually-hidden"> to ${esc(b.name)} (opens Google Maps)</span></span></a>`
        : `<span class="btn btn-ghost" aria-disabled="true">${icon('i-route')}<span>Directions to be added</span></span>`}
      ${b.phone ? `<a class="btn btn-ghost" href="tel:${b.tel}">${icon('i-phone')}<span>${callLabel()}</span></a>` : ''}
    </div>
  </div>
</article>`;

/* Compact contact card (Contact section, service pages) */
export const contactCard = b => `<article class="contact-card${b.confirmed ? '' : ' is-placeholder'}" aria-labelledby="cc-${b.id}">
  <div><h3 id="cc-${b.id}">${esc(b.name)}</h3>${b.confirmed ? '' : `<p style="margin:10px 0 0">${tbc()}</p>`}</div>
  ${infoList(b)}
  ${b.directions ? `<a class="link" href="${b.directions}" target="_blank" rel="noopener">Open in Google Maps<span class="visually-hidden"> (${esc(b.name)})</span></a>` : pending('Map link')}
</article>`;

export const callBar = () => `<div class="call-bar"><a class="btn btn-primary" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>Call now: ${PRIMARY.phone}</span></a></div>`;

/* PC-PNDT statement: shown in the footer and on pregnancy, scan and fertility pages */
export const pcpndtNote = () => `<p class="legal-note"><strong>PC-PNDT Act.</strong> ${esc(LEGAL.pcpndt)}${LEGAL.pcpndtConfirmed ? '' : ` ${tbc('Match the wording on the hospital notice board', 'tbc-inline')}`}</p>`;

/* Footer: closes the page the way the hero opens it, a heartbeat running into the logo's dial */
export const footer = (R = '') => `<footer class="site-footer">
  <div class="footer-hero">
    <svg class="footer-thread reveal-draw" viewBox="0 0 1440 100" preserveAspectRatio="none" fill="none" aria-hidden="true"><path pathLength="1" d="M0 50 H560 l16 -20 l18 44 l22 -68 l20 64 l14 -20 H1440"/></svg>
    <div class="footer-seal">
      ${dial('footer-dial', 72)}
      <span class="footer-face"><img class="footer-logo" src="${R}assets/img/logo.png" alt="${esc(SITE.name)} logo" width="720" height="402" loading="lazy"></span>
    </div>
    <p class="footer-name">${esc(SITE.name)}</p>
    <p class="footer-tagline">${esc(SITE.tagline)}</p>
    <div class="btn-row footer-actions">
      <a class="btn btn-primary" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>Call ${PRIMARY.phone}</span></a>
      <a class="btn btn-ghost" href="${R}#contact"><span>Book an appointment</span></a>
    </div>
  </div>
  <div class="wrap">
    <div class="footer-top">
      <div>
        <h2>${BRANCHES.length > 1 ? 'Branches' : 'Visit'}</h2>
        ${BRANCHES.map(b => `<div class="footer-branch"><strong>${esc(b.name)}</strong>${b.addressLines ? b.addressLines.map(esc).join(', ') : 'Address to be confirmed with client'}</div>`).join('')}
      </div>
      <div>
        <h2>Call</h2>
        ${BRANCHES.map(b => `<div class="footer-branch">${b.phone ? `<a href="tel:${b.tel}">${b.phone}</a> <span>Reception</span>` : 'Phone to be confirmed'}${(b.mobiles || []).map(m => `<br><a href="tel:${m.tel}">${m.phone}</a> <span>Mobile</span>`).join('')}</div>`).join('')}
        <div class="footer-branch footer-hours">${PRIMARY.days ? `<strong>OPD, ${PRIMARY.days}</strong>` : ''}${PRIMARY.hours ? PRIMARY.hours.map(([, h]) => h).join(', ') : ''}${EMERGENCY.available24h ? `<strong class="footer-er">Emergency open 24 hours, every day</strong>${EMERGENCY.tel ? `<a href="tel:${EMERGENCY.tel}">${EMERGENCY.phone}</a> <span>Emergency</span>` : ''}` : ''}</div>
      </div>
      <nav aria-label="Sections">
        <h2>Sections</h2>
        <ul>${navItems.map(([id, label]) => `<li><a href="${R}#${id}">${label}</a></li>`).join('')}</ul>
      </nav>
      <nav aria-label="Departments">
        <h2>Departments</h2>
        <ul>${SERVICES.map(s => `<li><a href="${R}services/${s.slug}/">${esc(s.name)}</a></li>`).join('')}</ul>
      </nav>
    </div>
    <div class="socials" aria-label="Social media (to be confirmed)">
      <span>Instagram, to be confirmed</span><span>Facebook, to be confirmed</span><span>YouTube, to be confirmed</span>
    </div>
    <div class="footer-legal">${pcpndtNote()}</div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} ${esc(SITE.name)}. All rights reserved.${SITE.registration ? ` ${esc(SITE.registration)}` : ''}</p>
      <p>Designed by <span>[studio credit, to be confirmed]</span></p>
      <a class="footer-top-link" href="#main"><span>Back to top</span>${icon('i-arrow')}</a>
    </div>
  </div>
</footer>`;

export const head = ({ title, description, R = '', extraCss = [] }) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0B2A6F">
<script>document.documentElement.className='js'</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400..700&display=swap">
<link rel="stylesheet" href="${R}assets/css/site.css">
${extraCss.map(f => `<link rel="stylesheet" href="${R}assets/css/${f}">`).join('\n')}
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="${R}assets/js/site.js" defer></script>`;

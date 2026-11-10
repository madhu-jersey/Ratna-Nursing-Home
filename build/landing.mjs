import { SITE, BRANCHES, PRIMARY, SERVICES, SERVICE_GROUPS, WHY, DOCTORS, FACILITIES, EMERGENCY, REVIEWS, BOOKING, SHOW_NOTES, WHATSAPP, waLink, timeLabel, sessionSlots } from './data.mjs';
import { esc, tbc, note, icon, sprite, header, footer, head, callBar, serviceMark, dial, BEAT } from './partials.mjs';
import { hospitalLd, faqLd } from './seo.mjs';

const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const count = n => NUM[n] || String(n);
const cap = s => s[0].toUpperCase() + s.slice(1);

const R = '';

/* ---------- Hero: one orchestrated entrance. The logo sits in a slow clinical dial; the heartbeat from its cross draws across the page ---------- */
const HEART = 'M0 50 H770 l16 -20 l18 44 l22 -68 l20 64 l14 -20 H1440';
const heroSlot = () => `<!-- HERO. If an approved hero design arrives, it replaces this <section> and the marquee.
     Keep its single <h1>. Nothing below depends on the hero's markup. -->
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-bg" aria-hidden="true">
    <svg class="hero-thread" viewBox="0 0 1440 100" preserveAspectRatio="none" fill="none">
      <path class="thread-base" d="${HEART}"/>
      <path class="thread-draw" pathLength="1" d="${HEART}"/>
      <path class="thread-glint" pathLength="1" d="${HEART}"/>
    </svg>
  </div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow hero-in" style="--d:0">${esc(PRIMARY.addressLines?.[1] || '')}, ${esc(SITE.town)}</p>
      <h1 id="hero-title" class="hero-title"><span class="line" style="--l:0"><span>Care for every</span></span> <span class="line" style="--l:1"><span>stage of</span></span> <span class="line" style="--l:2"><span>family life.</span></span></h1>
      <p class="hero-sub hero-in" style="--d:5">${esc(SITE.tagline)}</p>
      <div class="btn-row hero-in" style="--d:6">
        <a class="btn btn-primary" data-magnetic href="#contact"><span>Book an appointment</span></a>
        <a class="btn btn-ghost" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>Call ${PRIMARY.phone}</span></a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-seal">
        <svg class="seal-dial" viewBox="0 0 600 600" fill="none" aria-hidden="true">
          <circle class="seal-ring" cx="300" cy="300" r="296"/>
          <circle class="seal-ring seal-ring--in" cx="300" cy="300" r="250"/>
          <g class="seal-ticks">${Array.from({ length: 72 }, (_, i) => `<line x1="300" y1="${i % 6 ? 10 : 4}" x2="300" y2="${i % 6 ? 22 : 30}" transform="rotate(${i * 5} 300 300)"/>`).join('')}</g>
        </svg>
        <div class="seal-face">
          <img class="hero-logo" src="${R}assets/img/logo-480.png" srcset="${R}assets/img/logo-480.png 480w, ${R}assets/img/logo.png 720w" sizes="(max-width: 759px) 50vw, 420px" alt="${esc(SITE.name)} logo" width="720" height="402" fetchpriority="high" decoding="async">
        </div>
      </div>
    </div>
  </div>
  <div class="wrap">
    <ul class="hero-strip" role="list">
      <li class="hero-in" style="--d:8"><span class="strip-label">Reception</span><a class="strip-value" href="tel:${PRIMARY.tel}">${PRIMARY.phone}</a></li>
      <li class="hero-in" style="--d:9"><span class="strip-label">OPD${PRIMARY.days ? `, ${PRIMARY.days}` : ''}</span><span class="strip-value">${PRIMARY.hours ? PRIMARY.hours.map(([, h]) => h).join(', ') : tbc('To be confirmed')}</span></li>
      <li class="hero-in" style="--d:10"><span class="strip-label">Emergency</span><span class="strip-value">${EMERGENCY.available24h ? 'Open 24 hours, every day' : tbc('To be confirmed')}</span>${EMERGENCY.tel ? `<a class="strip-sub" href="tel:${EMERGENCY.tel}">Call ${EMERGENCY.phone}</a>` : ''}</li>
    </ul>
  </div>
</section>
<div class="marquee" aria-hidden="true">
  <div class="marquee-track">${[0, 1].map(() => `<span class="marquee-group">${SERVICES.map(s => `<span>${esc(s.name)}</span>${icon('m-cross', 'marquee-cross')}`).join('')}</span>`).join('')}</div>
</div>`;

/* ---------- 1. Services: three groups, each a ticked list; items with a department page link to it ---------- */
const services = () => `<section id="services" class="section services" aria-labelledby="services-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Services</p>
        <h2 id="services-title">Medical, surgical and maternity care in ${esc(SITE.town)}</h2>
      </div>
      <p class="intro reveal">From a fever to a pregnancy to keyhole surgery, your care stays with the same hospital and the same records.</p>
    </div>
    <div class="svc-groups" data-stagger data-swipe role="group" aria-label="Service groups">
      ${SERVICE_GROUPS.map(g => `<article class="svc-group">
        <span class="svc-mark">${serviceMark(g.mark)}</span>
        <h3>${esc(g.title)}</h3>
        <ul class="tick-list" role="list">${g.items.map(it => `<li>${icon('i-check', 'tick')}${it.slug
          ? `<a href="${R}services/${it.slug}/">${esc(it.text)}</a>`
          : `<span>${esc(it.text)}</span>`}</li>`).join('')}</ul>
        ${g.facilities && !FACILITIES.verified ? note('List to be verified with the hospital') : ''}
      </article>`).join('')}
    </div>
  </div>
</section>`;

/* ---------- 1b. Why choose: four reasons, the logo standing in for the name ---------- */
const why = () => `<section class="section why" aria-labelledby="why-title">
  <div class="wrap">
    <div class="why-head reveal">
      <h2 id="why-title">Why choose <img class="why-logo" src="${R}assets/img/logo-240.png" alt="${esc(SITE.name)}" width="240" height="134" loading="lazy" decoding="async"></h2>
      <p class="intro">What families in and around ${esc(SITE.town)} can count on, every time they walk in.</p>
    </div>
    <ul class="why-grid" role="list" data-stagger>
      ${WHY.map(w => `<li class="why-card">
        <span class="why-icon">${icon(w.icon)}</span>
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.text)}</p>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

/* ---------- 2. How we treat you: three steps that light up in turn ---------- */
const STEPS = [
  ['We explain what we find', 'After the examination and any tests, your doctor tells you what they found, in plain words and in your language.'],
  ['We show you the options', 'Medicines, a procedure, or watching and waiting: you hear what each choice involves before deciding.'],
  ['We agree a plan with you', 'Treatment begins only when you and your family are comfortable with the plan.']
];
const approach = () => `<section class="section approach" aria-labelledby="approach-title">
  <div class="wrap approach-grid">
    <div class="approach-head">
      <div class="reveal">
        <p class="eyebrow">How we treat you</p>
        <h2 id="approach-title">Before any treatment begins</h2>
      </div>
      <svg class="approach-beat reveal-draw" viewBox="0 0 400 40" fill="none" aria-hidden="true"><path pathLength="1" d="${BEAT}"/></svg>
    </div>
    <div class="steps-wrap">
    <span class="flow-rail" aria-hidden="true"><span class="flow-fill"></span></span>
    <ol class="steps-flow">
      ${STEPS.map(([t, d], i) => `<li class="flow-step">
        <span class="flow-num" aria-hidden="true">${i + 1}</span>
        <h3>${t}</h3>
        <p>${d}</p>
      </li>`).join('')}
    </ol>
    </div>
  </div>
</section>`;

/* ---------- 4. Doctors: one wide card each, the portrait alternating sides; a dial with initials until photos arrive ---------- */
const initials = name => name.replace(/^Dr\.?\s*/, '').split(/\s+/).slice(-2).map(w => w[0]).join('');
const doctorCard = d => {
  const b = BRANCHES.find(x => x.id === d.branch);
  return `<article class="doc-card reveal">
    <div class="doc-photo">
      ${dial('doc-dial', 72)}
      <span class="doc-face"><span class="doc-initials" aria-hidden="true">${esc(initials(d.name))}</span></span>
      ${SHOW_NOTES ? '<span class="doc-photo-note">Photo to be supplied</span>' : ''}
    </div>
    <div class="doc-info">
      <p class="doc-dept">${esc(d.specialty)}</p>
      <h3 class="doc-name">${esc(d.name)}</h3>
      <p class="doc-qual">${esc(d.qualification)}${d.regNo ? `<span class="doc-reg">Reg. No. ${esc(d.regNo)}</span>` : ''}</p>
      ${d.bio ? `<p class="doc-bio">${esc(d.bio)}</p>` : ''}
      ${d.areas?.length ? `<h4 class="doc-areas-title">Areas of care</h4>
      <ul class="tick-list doc-areas" role="list">${d.areas.map(a => `<li>${icon('i-check', 'tick')}<span>${esc(a)}</span></li>`).join('')}</ul>` : ''}
      ${b.hours ? `<h4 class="doc-times-title">OPD${b.days ? `, ${b.days}` : ''}</h4>
      <ul class="doc-times" role="list">${b.hours.map(([s, h]) => `<li>${icon('i-clock')}<span>${s}, ${h}</span></li>`).join('')}</ul>` : ''}
      <a class="btn btn-primary doc-book" href="#contact" data-book-doctor="${esc(d.name)}" data-branch="${b.id}" data-service="${svcFor(d.specialty)}"><span>Book with this doctor</span><span class="visually-hidden">: ${esc(d.name)}</span></a>
    </div>
  </article>`;
};

const doctors = () => `<section id="doctors" class="section doctors" aria-labelledby="doctors-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Consultants and doctors</p>
        <h2 id="doctors-title">Doctors at ${esc(SITE.name)}</h2>
      </div>
      <p class="intro reveal">General physicians and gynaecologists in ${esc(SITE.town)}. Choose a doctor and we will add their name to your appointment request.</p>
    </div>
    <div class="doc-list">${DOCTORS.filter(d => d.name).map(doctorCard).join('')}</div>
  </div>
</section>`;

/* ---------- 5. Find us: one raised card, details beside a light map ---------- */
const place = b => `<div class="visit">
  <div class="visit-info">
    <h3 class="visit-name">${esc(b.name)}</h3>
    <address class="visit-address">${b.addressLines ? `${esc(b.addressLines[0])}<br>${b.addressLines.slice(1).map(esc).join(', ')}` : 'Address to be confirmed'}</address>
    <dl class="visit-lines">
      ${b.phone || b.mobiles?.length ? `<div><dt>Phone</dt><dd>${b.phone ? `<a href="tel:${b.tel}">${b.phone}</a>` : ''}${(b.mobiles || []).map(m => `<a href="tel:${m.tel}">${m.phone}</a>`).join('')}</dd></div>` : ''}
      <div><dt>OPD timings</dt><dd>${b.hours ? `<span class="visit-hours">${b.days ? `<span class="visit-days">${b.days}</span>` : ''}${b.hours.map(([d, h]) => `<span><strong>${d}</strong> ${h}</span>`).join('')}${b.days ? '<span><strong>Sunday</strong> OPD closed</span>' : ''}</span>` : tbc('To be confirmed')}</dd></div>
      ${EMERGENCY.available24h ? `<div><dt>Emergency</dt><dd><strong class="visit-emergency">Open 24 hours</strong>${EMERGENCY.tel ? `<a href="tel:${EMERGENCY.tel}">${EMERGENCY.phone}</a>` : ''}</dd></div>` : ''}
    </dl>
    <div class="visit-actions">
      ${b.phone ? `<a class="btn btn-primary" href="tel:${b.tel}">${icon('i-phone')}<span>Call reception</span></a>` : ''}
      ${b.directions
        ? `<a class="btn btn-ghost" href="${b.directions}" target="_blank" rel="noopener">${icon('i-route')}<span>Get directions<span class="visually-hidden"> (opens Google Maps)</span></span></a>`
        : `<span class="btn btn-ghost" aria-disabled="true">${icon('i-route')}<span>Directions link to be added</span></span>`}
      ${b.addressLines ? `<button class="btn btn-ghost" type="button" data-copy="${esc([b.name.replace(/^Main hospital, /, SITE.name + ', '), ...b.addressLines].join(', '))}">${icon('i-pin')}<span class="copy-label">Copy address</span></button>` : ''}
    </div>
    <p class="copy-status visually-hidden" role="status" aria-live="polite"></p>
  </div>
  <div class="visit-map">
    ${b.geo
      ? `<iframe class="visit-iframe" src="https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m3!2m1!1s${b.geo.join(',')}!6i16" title="Map: ${esc(SITE.name)}, ${esc(b.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    ${b.mapUrl ? `<a class="map-open" href="${b.mapUrl}" target="_blank" rel="noopener">${icon('i-pin')}<span>Open in Google Maps</span><span class="visually-hidden"> (opens in a new tab)</span></a>` : ''}`
      : tbc('Map to be added')}
  </div>
</div>`;

const branches = () => `<section id="branches" class="section find-us" aria-labelledby="branches-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Find us</p>
        <h2 id="branches-title">${BRANCHES.length > 1 ? `${cap(count(BRANCHES.length))} locations in ${esc(SITE.region)}` : `In ${esc(PRIMARY.addressLines?.[1] || SITE.town)}, ${esc(SITE.town)}`}</h2>
      </div>
      <p class="intro reveal">${BRANCHES.length > 1 ? 'Visit whichever is closer. Your records can be shared between branches.' : 'Near the railway over bridge in Sajjapuram. Call reception before you come if you are unsure about timings.'}</p>
    </div>
    <div class="places">${BRANCHES.map(place).join('')}</div>
  </div>
</section>`;

/* ---------- 6. Gallery: a mixed grid of frames ---------- */
const GALLERY = [
  ['Hospital entrance', 'hospital', 'g-tall'], ['General ward', 'wards', 'g-wide'], ['Ultrasound room', 'facilities', 'g-wide'],
  ['Reception', 'hospital', 'g-sq'], ['Doctors and nursing team', 'team', 'g-wide'], ['Waiting area', 'hospital', 'g-tall'],
  ['Fetal monitoring', 'facilities', 'g-sq'], ['Pharmacy', 'facilities', 'g-wide'], ['Patient room', 'wards', 'g-wide']
];
const GALLERY_TABS = [['all', 'All'], ['hospital', 'Hospital'], ['wards', 'Wards'], ['facilities', 'Facilities'], ['team', 'Team']];
const gallery = () => `<section id="gallery" class="section gallery is-collapsed" aria-labelledby="gallery-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Gallery</p>
        <h2 id="gallery-title" class="logo-title">Inside <img class="title-logo" src="${R}assets/img/logo-240.png" alt="${esc(SITE.name)}" width="240" height="134" loading="lazy" decoding="async"></h2>
      </div>
      <p class="intro reveal">A look at our hospital${SHOW_NOTES ? '. Each frame is labelled with the photo it will hold' : ', from the entrance to the wards'}.</p>
    </div>
    <div class="tabs reveal" role="tablist" aria-label="Filter photos">
      ${GALLERY_TABS.map(([f, l], i) =>
        `<button class="tab" type="button" role="tab" data-filter="${f}" aria-selected="${i === 0}" aria-controls="gallery-grid"${i ? ' tabindex="-1"' : ''}>${l}</button>`).join('')}
      <span class="tab-ink" aria-hidden="true"></span>
    </div>
    <ul id="gallery-grid" class="bento" role="list">
      ${GALLERY.map(([label, cat, size], i) => `<li data-cat="${cat}" class="${size} reveal-mask" style="--i:${i % 4}">
        <button class="g-item" type="button" data-caption="${label}${SHOW_NOTES ? ': photo to be supplied' : ''}" aria-label="Open ${label}${SHOW_NOTES ? " placeholder" : ""}">
          <span class="photo-ph"><span class="ph-inner" aria-hidden="true"></span>
            <span class="ph-label">${icon('i-image', 'ph-glyph')}${SHOW_NOTES ? '<span class="small">Photo to be supplied</span>' : ''}</span>
            <strong class="g-caption">${label}</strong>
          </span>
        </button>
      </li>`).join('')}
    </ul>
    <button class="btn btn-ghost gallery-more" type="button" aria-controls="gallery-grid" aria-expanded="false"><span>View more photos</span>${icon('i-arrow')}</button>
  </div>
  <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" hidden>
    <button class="lb-btn lb-close" type="button" aria-label="Close photo viewer">${icon('i-close')}</button>
    <button class="lb-btn lb-prev" type="button" aria-label="Previous photo">${icon('i-left')}</button>
    <button class="lb-btn lb-next" type="button" aria-label="Next photo">${icon('i-right')}</button>
    <figure><div class="lb-stage"></div><figcaption class="lb-caption"><span class="lb-text"></span><span class="lb-count" aria-live="polite"></span></figcaption></figure>
  </div>
</section>`;

/* ---------- 7. Google reviews: chosen by the hospital, copied word for word from Google ---------- */
const stars = (n = 5, filled = 0) => `<span class="stars">${Array.from({ length: n }, (_, i) => icon(i < filled ? 'i-star' : 'i-star-o')).join('')}</span>`;
const partStars = r => `<span class="stars-part" style="--pct:${(r / 5 * 100).toFixed(1)}%" role="img" aria-label="${r} out of 5 stars">${stars(5, 0)}<span class="stars-fill" aria-hidden="true">${stars(5, 5)}</span></span>`;
// Which doctors each review names, matched on the spellings patients use ("Amrutharatna", "Subbalakshmi", "Ghanashyam")
const NAMED = [
  ['Dr. Valluri Amrutha Ratna', /amrutha/i],
  ['Dr. Valluri Subba Lakshmi', /subba\s*lakshmi/i],
  ['Dr. Bikkina Ghana Syam', /ghana\s*s?h?yam/i],
  ['Dr. Valluri Soma Sekhar', /soma\s*sekhar/i]
];
const namedIn = text => NAMED.filter(([, re]) => re.test(text)).map(([n]) => n);
const shortName = n => n.replace(/^Dr\. (Valluri|Bikkina) /, 'Dr. ');
const titleCase = s => s.trim().replace(/\b\p{L}/gu, c => c.toUpperCase());

const reviews = () => {
  const mentions = NAMED.map(([n]) => [n, REVIEWS.filter(r => namedIn(r.text).includes(n)).length]).filter(([, c]) => c).sort((a, b) => b[1] - a[1]);
  return `<section id="reviews" class="section reviews" aria-labelledby="reviews-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Google reviews</p>
        <h2 id="reviews-title">What patients say</h2>
      </div>
      <p class="intro reveal">In their own words, copied from the hospital's Google listing.</p>
    </div>
    <div class="reviews-grid">
      <aside class="rating reveal" aria-label="Google rating">
        <div class="rating-top">
          <div class="rating-dial">
            ${dial('rating-ring', 72)}
            <div class="rating-face">
              <span class="rating-value">${SITE.rating ?? '&ndash;.&ndash;'}</span>
              ${SITE.rating ? partStars(SITE.rating) : `<span aria-hidden="true">${stars(5, 0)}</span>`}
            </div>
          </div>
          <p class="rating-line">${SITE.rating ? `<strong>${SITE.rating} out of 5</strong><span>from ${SITE.reviewCount} reviews on Google</span>` : 'Rating to be confirmed from the Google listing.'}</p>
        </div>
        ${mentions.length ? `<div class="rating-mentions">
          <h3>Doctors patients name</h3>
          <ul role="list">${mentions.map(([n, c]) => `<li><span>${esc(shortName(n))}</span><span class="mention-count">${c} of ${REVIEWS.length} reviews</span></li>`).join('')}</ul>
        </div>` : ''}
        ${SITE.googleListing
          ? `<a class="btn btn-ghost rating-link" href="${SITE.googleListing}" target="_blank" rel="noopener"><span>Read all ${SITE.reviewCount || ''} on Google</span>${icon('i-arrow')}<span class="visually-hidden"> (opens in a new tab)</span></a>`
          : note('Google listing link to be confirmed')}
      </aside>
      <div class="carousel reveal" aria-roledescription="carousel" aria-label="Patient reviews">
        <ul class="carousel-track" role="list" tabindex="0" aria-label="Patient reviews, scroll horizontally">
          ${REVIEWS.map((r, i) => {
            const named = namedIn(r.text);
            return `<li aria-roledescription="slide" aria-label="${i + 1} of ${REVIEWS.length}">
            <article class="review">
              <div class="review-top">
                <span role="img" aria-label="5 out of 5 stars">${stars(5, 5)}</span>
                <svg class="review-quote" viewBox="0 0 32 24" aria-hidden="true"><path d="M0 24V14C0 6 4.6 1.2 12 0l1.4 3.4C8.8 5 6.8 8 6.6 12H12v12zm18 0V14c0-8 4.6-12.8 12-14l1.4 3.4c-4.6 1.6-6.6 4.6-6.8 8.6H30v12z"/></svg>
              </div>
              <blockquote class="review-text" id="review-${i}">${r.text.split(/\n+/).map(t => `<p>${esc(t)}</p>`).join('')}</blockquote>
              <button class="review-more" type="button" aria-expanded="false" aria-controls="review-${i}" hidden>Read more</button>
              <div class="review-head">
                <span class="review-avatar" aria-hidden="true">${esc(r.name.trim()[0].toUpperCase())}</span>
                <span class="review-who"><span class="review-name">${esc(titleCase(r.name))}</span><span class="review-src">Google review</span></span>
              </div>
              ${named.length ? `<p class="review-tag">${icon('i-person')}<span>Names ${named.map(n => esc(shortName(n))).join(' and ')}</span></p>` : ''}
            </article>
          </li>`;
          }).join('')}
        </ul>
        <div class="carousel-controls">
          <button class="icon-btn" type="button" data-dir="-1" aria-label="Previous review">${icon('i-left')}</button>
          <button class="icon-btn" type="button" data-dir="1" aria-label="Next review">${icon('i-right')}</button>
          <button class="icon-btn carousel-pause" type="button" aria-pressed="false" aria-label="Pause automatic scrolling">${icon('i-pause', 'i-pause')}<svg class="i-play" hidden aria-hidden="true"><use href="#i-play"/></svg></button>
          <span class="carousel-status" aria-live="polite"></span>
        </div>
      </div>
    </div>
  </div>
</section>`;
};

/* ---------- 8. Book an appointment: one short form, with the phone beside it ---------- */
const shortTime = hhmm => { const [h, m] = hhmm.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`; };
const svcFor = specialty => SERVICES.find(s => s.name === specialty)?.slug || '';
const contact = () => `<section id="contact" class="section book" aria-labelledby="contact-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Appointments</p>
        <h2 id="contact-title">Book an appointment</h2>
      </div>
      <p class="intro reveal">Choose a time, then send your request on WhatsApp to ${WHATSAPP.display}. Reception confirms it in the same chat.</p>
    </div>
    <div class="book-grid">
      <form id="appointment-form" class="book-form reveal" action="#" method="post" aria-describedby="form-note" ${bookingAttrs()}>
        <div class="form-grid">
          <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" autocomplete="name" required aria-describedby="e-name"><span class="error" id="e-name" aria-live="polite"></span></div>
          <div class="field"><label for="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="e-phone"><span class="error" id="e-phone" aria-live="polite"></span></div>
          <div class="field"><label for="f-email">Email <span class="req">(optional)</span></label><input id="f-email" name="email" type="email" inputmode="email" autocomplete="email" aria-describedby="e-email"><span class="error" id="e-email" aria-live="polite"></span></div>
          <div class="field date-field"><label for="f-date">Preferred day <span class="req">(Mon to Sat)</span></label><input id="f-date" name="date" type="date" required aria-describedby="e-date"><span class="error" id="e-date" aria-live="polite"></span></div>
          <div class="field"><label for="f-service">Department <span class="req">(optional)</span></label><select id="f-service" name="service"><option value="">Not sure yet</option>${SERVICES.map(s => `<option value="${s.slug}">${esc(s.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="f-doctor">Doctor <span class="req">(optional)</span></label><select id="f-doctor" name="doctor"><option value="">No preference</option>${DOCTORS.filter(d => d.name).map(d => `<option value="${esc(d.name)}">${esc(d.name)}</option>`).join('')}</select></div>
          <div class="field field-note"><label for="f-msg">Anything we should know? <span class="req">(optional)</span></label><input id="f-msg" name="message" placeholder="Fever for three days"></div>
          <fieldset class="field field-full slot-field" aria-describedby="e-time">
            <legend>Preferred time <span class="req">(${BOOKING.slotMinutes}-minute appointments)</span></legend>
            <div class="session-switch" role="group" aria-label="Session" hidden>${BOOKING.sessions.map((sess, i) => `<button class="session-btn" type="button" aria-pressed="${i === 0}" aria-controls="slots-${i}">${sess[0]}<span>${shortTime(sess[1])} to ${shortTime(sess[2])}</span></button>`).join('')}</div>
            ${BOOKING.sessions.map((sess, i) => `<div class="slot-group" id="slots-${i}">
              <p class="slot-session"><strong>${sess[0]}</strong> <span class="slot-range">${timeLabel(sess[1])} to ${timeLabel(sess[2])}</span></p>
              <div class="slot-row">${sessionSlots(sess).map(t => `<label class="slot"><input type="radio" name="time" value="${t}" required><span>${timeLabel(t)}</span></label>`).join('')}</div>
            </div>`).join('')}
            <span class="error" id="e-time" aria-live="polite"></span>
          </fieldset>
          ${BRANCHES.length > 1
            ? `<div class="field"><label for="f-branch">Branch</label><select id="f-branch" name="branch" required aria-describedby="e-branch"><option value="">Choose a branch</option>${BRANCHES.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('')}</select><span class="error" id="e-branch" aria-live="polite"></span></div>`
            : `<input type="hidden" name="branch" value="${BRANCHES[0].id}">`}
        </div>
        ${trapFields('page')}
        <div class="book-foot">
          <button class="btn btn-primary book-submit" type="submit"><span class="submit-label">Request appointment</span></button>
          <p class="small book-note" id="form-note">This is a request. Reception confirms your time on WhatsApp.</p>
        </div>
        <p class="book-alt">Prefer to call? <a href="tel:${PRIMARY.tel}">${PRIMARY.phone}</a>${EMERGENCY.available24h ? `. In an emergency, call <a href="tel:${EMERGENCY.national}">${EMERGENCY.national}</a> or come straight in, any time.` : '.'}</p>
        <div id="form-status" class="form-status" role="status" tabindex="-1" hidden></div>
      </form>

      <aside class="book-call reveal" aria-labelledby="book-call-title">
        <h3 id="book-call-title">Prefer to call?</h3>
        <p>Reception will book you in over the phone, or chat on WhatsApp.</p>
        ${PRIMARY.phone ? `<a class="book-call-main" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>${PRIMARY.phone}</span></a>` : ''}
        ${PRIMARY.mobiles?.length ? `<div class="book-call-alts">${PRIMARY.mobiles.map(m => m.whatsapp
          ? `<a class="book-call-alt is-wa" href="${waLink('Hello Ratna Nursing Home, I would like to book an appointment.')}" target="_blank" rel="noopener">${icon('i-whatsapp')}<span>${m.phone}</span><span class="visually-hidden"> on WhatsApp</span></a>`
          : `<a class="book-call-alt" href="tel:${m.tel}">${m.phone}</a>`).join('')}</div>` : ''}
        <dl class="book-times">
          ${BOOKING.sessions.map(([n, a, b]) => `<div><dt>${n}</dt><dd>${timeLabel(a)} to ${timeLabel(b)}</dd></div>`).join('')}
          ${PRIMARY.days ? '<div><dt>Sunday</dt><dd>OPD closed</dd></div>' : ''}
        </dl>
        <p class="book-emergency"><strong>Emergency?</strong>${EMERGENCY.available24h ? ' Open 24 hours.' : ''} Call <a href="tel:${EMERGENCY.national}">${EMERGENCY.national}</a>${EMERGENCY.tel ? ` or <a href="tel:${EMERGENCY.tel}">${EMERGENCY.phone}</a>` : ''}. Do not use this form.</p>
      </aside>
    </div>
  </div>
</section>`;

/* Shared by both booking forms: where requests go, and the fields people never see */
const bookingAttrs = () => `data-booking data-whatsapp="${WHATSAPP.number}"${BOOKING.endpoint ? ` data-endpoint="${esc(BOOKING.endpoint)}"` : ''}`;
const trapFields = source => `<input type="hidden" name="source" value="${source}"><div class="trap" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></div>`;

/* ---------- Booking popup: rises in once per visit, after a short while on the page ---------- */
const bookingPopup = () => `<div id="book-pop" class="book-pop" role="dialog" aria-modal="true" aria-labelledby="pop-title" data-scroll="${BOOKING.popupScroll}" data-delay="${BOOKING.popupDelay}" hidden>
  <div class="pop-backdrop" data-pop-close></div>
  <div class="pop-card">
    <svg class="pop-beat" viewBox="0 0 400 40" preserveAspectRatio="none" fill="none" aria-hidden="true"><path pathLength="1" d="${BEAT}"/></svg>
    <button class="pop-close" type="button" data-pop-close aria-label="Close">${icon('i-close')}</button>
    <div class="pop-head">
      <span class="pop-seal">${dial('pop-dial', 48)}<img src="${R}assets/img/logo-240.png" alt="" width="240" height="134" loading="lazy" decoding="async"></span>
      <div>
        <h2 id="pop-title">Book an appointment</h2>
        <p>Leave your details, then send them to us on WhatsApp.</p>
      </div>
    </div>
    <form class="pop-form" action="#" method="post" ${bookingAttrs()}>
      <div class="field"><label for="p-name">Your name</label><input id="p-name" name="name" autocomplete="name" required aria-describedby="pe-name"><span class="error" id="pe-name" aria-live="polite"></span></div>
      <div class="field"><label for="p-phone">Phone number</label><input id="p-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="pe-phone"><span class="error" id="pe-phone" aria-live="polite"></span></div>
      <div class="field"><label for="p-email">Email <span class="req">(optional)</span></label><input id="p-email" name="email" type="email" inputmode="email" autocomplete="email" aria-describedby="pe-email"><span class="error" id="pe-email" aria-live="polite"></span></div>
      <div class="pop-pair">
        <div class="field date-field"><label for="p-date">Day</label><input id="p-date" name="date" type="date" required aria-describedby="pe-date"><span class="error" id="pe-date" aria-live="polite"></span></div>
        <div class="field"><label for="p-time">Time</label>
          <select id="p-time" name="time" required aria-describedby="pe-time"><option value="">Choose a time</option>${BOOKING.sessions.map(sess => `<optgroup label="${sess[0]}, ${timeLabel(sess[1])} to ${timeLabel(sess[2])}">${sessionSlots(sess).map(t => `<option value="${t}">${timeLabel(t)}</option>`).join('')}</optgroup>`).join('')}</select><span class="error" id="pe-time" aria-live="polite"></span></div>
      </div>
      <p class="pop-hours">OPD ${PRIMARY.days || ''}: ${BOOKING.sessions.map(([, a, b]) => `${timeLabel(a)} to ${timeLabel(b)}`).join(' and ')}. ${BOOKING.slotMinutes}-minute appointments.</p>
      <div class="field"><label for="p-service">Department <span class="req">(optional)</span></label>
        <select id="p-service" name="service"><option value="">Choose a department</option>${SERVICES.map(s => `<option value="${s.slug}">${esc(s.name)}</option>`).join('')}</select></div>
      ${trapFields('popup')}
      <button class="btn btn-primary pop-submit" type="submit"><span class="submit-label">Request appointment</span></button>
      <div class="form-status" role="status" tabindex="-1" hidden></div>
    </form>
    <p class="pop-call">Prefer to call? <a href="tel:${PRIMARY.tel}">${PRIMARY.phone}</a></p>
  </div>
</div>`;

/* ---------- 9. FAQ: the questions people search for first, answered from the facts above ---------- */
const docsIn = specialty => DOCTORS.filter(d => d.specialty === specialty).map(d => `${d.name} (${d.qualification})`).join(' and ');
const svcLink = (slug, text) => `<a href="${R}services/${slug}/">${text}</a>`;
const opd = PRIMARY.hours ? `${PRIMARY.days ? `${PRIMARY.days}, ` : ''}${PRIMARY.hours.map(([d, h]) => `${d.toLowerCase()} ${h}`).join(' and ')}` : '';
// [question, answer, topic]. Topics drive the filter chips; the order is what people ask first.
const FAQ = [
  [`Which gynaecologists are available at ${SITE.name}, ${SITE.town}?`, `<p>${docsIn('Obstetrics & Gynaecology')} see patients for pregnancy check-ups, normal and caesarean delivery, periods, PCOD and other women's health problems.</p><p>See ${svcLink('obstetrics-gynaecology', 'Obstetrics &amp; Gynaecology')} for what the department offers.</p>`, 'women'],
  [`Is there a maternity hospital in ${SITE.town} for normal delivery and caesarean section?`, `<p>Yes. ${SITE.name} in ${esc(PRIMARY.addressLines[1])}, ${SITE.town} cares for mothers through pregnancy and childbirth: antenatal check-ups, ultrasound scans, electronic fetal monitoring, normal delivery, caesarean section when it is needed, and care for mother and baby afterwards.</p>${EMERGENCY.available24h ? `<p>The hospital is open 24 hours for emergencies in pregnancy. Call <a href="tel:${EMERGENCY.tel}">${EMERGENCY.phone}</a>.</p>` : ''}`, 'women'],
  [`Where can I get an ultrasound scan in ${SITE.town}?`, `<p>${SITE.name} does pregnancy, abdominal and pelvic scans, and follicular monitoring for couples trying to conceive. Your scan is read by the doctor treating you. See ${svcLink('ultrasound', 'Ultrasound Scanning')}.</p>`, 'care'],
  ['Will the scan tell us whether the baby is a boy or a girl?', `<p>No. Telling the sex of an unborn baby is against the law in India under the PC &amp; PNDT Act, and it is not done at this hospital. Scans in pregnancy check the baby's growth, position and well-being.</p>`, 'women'],
  [`Do you offer infertility treatment in ${SITE.town}?`, `<p>Yes. Both partners are evaluated together, then treatment can include medicines to help eggs grow and be released, with scans to follow each cycle. See ${svcLink('infertility', 'Infertility Treatment')}.</p>`, 'women'],
  [`Is laparoscopic (keyhole) surgery available in ${SITE.town}?`, `<p>Yes. Keyhole operations are done through small cuts, for less pain, a shorter stay and a quicker return to normal life. Call reception to check whether the operation you need is done here. See ${svcLink('laparoscopic-surgery', 'Laparoscopic Surgery')}.</p>`, 'care'],
  [`Who are the general physicians at ${SITE.name}?`, `<p>${docsIn('General Medicine')} treat diabetes, thyroid problems, blood pressure, fever and infections, breathing problems and kidney problems. See ${svcLink('general-medicine', 'General Medicine')}.</p>`, 'care'],
  [`Is ${SITE.name} open 24 hours for emergencies?`, EMERGENCY.available24h ? `<p>Yes. The emergency department is open 24 hours, every day, including Sundays and holidays.${EMERGENCY.tel ? ` Call <a href="tel:${EMERGENCY.tel}">${EMERGENCY.phone}</a>.` : ''}</p><p>For chest pain, sudden weakness of the face or arm, trouble breathing, a fit, heavy bleeding, or bleeding or severe pain in pregnancy, call <a href="tel:${EMERGENCY.national}">${EMERGENCY.national}</a> for an ambulance or come straight in.</p>` : `<p>${tbc('Casualty hours to be confirmed')}</p>`, 'visit'],
  [`What are the OPD timings at ${SITE.name}?`, opd ? `<p>OPD runs ${opd}. OPD is closed on Sunday${EMERGENCY.available24h ? ', but the emergency department stays open' : ''}.</p>` : `<p>${tbc('OPD timings to be confirmed')}</p>`, 'visit'],
  ['How do I book an appointment?', `<p>Choose a day and time in the <a href="#contact">booking form</a>, then send it on WhatsApp to <a href="${waLink()}" target="_blank" rel="noopener">${WHATSAPP.display}</a>. Reception confirms your appointment in the same chat. You can also message that number directly, or call reception on <a href="tel:${PRIMARY.tel}">${PRIMARY.phone}</a>.</p>`, 'visit'],
  [`Where is ${SITE.name} in ${SITE.town}?`, `<p>${PRIMARY.addressLines.map(esc).join(', ')}, ${SITE.state}. ${PRIMARY.directions ? `<a href="${PRIMARY.directions}" target="_blank" rel="noopener">Get directions on Google Maps</a>.` : ''}</p>`, 'visit']
];
const FAQ_TOPICS = [['all', 'All'], ['women', 'Pregnancy'], ['care', 'Treatment'], ['visit', 'Visiting']];

// Shared with the department pages. On the home page each item carries its topic, and one answer is open at a time.
export const accordion = (items, prefix, { single = false } = {}) => `<div class="accordion"${single ? ' data-single data-stagger' : ''}>${items.map(([q, a, topic], i) => `<div class="acc-item"${topic ? ` data-topic="${topic}"` : ''} style="--k:${i}">
  <h3><button class="acc-btn" type="button" aria-expanded="false" aria-controls="${prefix}-${i}" id="${prefix}-q${i}">${esc(q)}<span class="plus" aria-hidden="true"></span></button></h3>
  <div class="acc-panel" id="${prefix}-${i}" role="region" aria-labelledby="${prefix}-q${i}"><div class="acc-inner">${a}</div></div>
</div>`).join('')}</div>`;

const faq = () => `<section id="faq" class="section faq" aria-labelledby="faq-title">
  <div class="wrap faq-grid">
    <div class="faq-side">
      <div class="section-head">
        <div class="reveal">
          <p class="eyebrow">FAQ</p>
          <h2 id="faq-title">Questions about ${esc(SITE.name)}</h2>
        </div>
        <p class="intro reveal">Quick answers about our doctors, treatment and visiting the hospital in ${esc(SITE.town)}.</p>
      </div>
      <aside class="faq-help reveal" aria-labelledby="faq-help-title">
        <span class="faq-help-mark">${icon('i-phone')}</span>
        <h3 id="faq-help-title">Still have a question?</h3>
        <p>Reception will answer it on the phone${PRIMARY.days ? `, ${PRIMARY.days}` : ''}.</p>
        <div class="faq-help-actions">
          <a class="btn btn-primary" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>Call ${PRIMARY.phone}</span></a>
          <a class="btn btn-ghost" href="#contact"><span>Book an appointment</span></a>
        </div>
        ${EMERGENCY.available24h ? '<p class="faq-help-er">Emergency department open 24 hours</p>' : ''}
      </aside>
    </div>
    <div class="faq-main">
      <div class="faq-topics reveal" role="group" aria-label="Show questions about">
        ${FAQ_TOPICS.map(([t, label], i) => `<button class="faq-topic" type="button" data-topic="${t}" aria-pressed="${i === 0}">${label}<span class="faq-count">${t === 'all' ? FAQ.length : FAQ.filter(x => x[2] === t).length}</span></button>`).join('')}
      </div>
      ${accordion(FAQ, 'faq', { single: true })}
      <p class="visually-hidden" role="status" aria-live="polite" data-faq-status></p>
    </div>
  </div>
</section>`;

export const landing = () => `<!doctype html>
<html lang="en" class="no-js">
<head>
${head({
  title: `${SITE.name}, ${SITE.town} | Gynaecologist, Maternity and General Physician`,
  description: `Hospital in ${PRIMARY.addressLines[1]}, ${SITE.town} for pregnancy care and delivery, gynaecology, ultrasound, infertility, keyhole surgery and general medicine.${EMERGENCY.available24h ? ' 24-hour emergency.' : ''}`,
  R, extraCss: ['home.css'], path: '', jsonLd: [hospitalLd(), faqLd(FAQ)]
})}
</head>
<body class="home">
${sprite()}
${header(R)}
<main id="main">
${heroSlot()}
${services()}
${why()}
${approach()}
${doctors()}
${branches()}
${gallery()}
${reviews()}
${contact()}
${faq()}
</main>
${bookingPopup()}
${footer(R)}
${callBar()}
</body>
</html>
`;

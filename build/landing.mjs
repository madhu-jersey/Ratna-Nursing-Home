import { SITE, BRANCHES, PRIMARY, SERVICES, DOCTORS, FACILITIES, EMERGENCY, REVIEWS, BOOKING, timeLabel, sessionSlots } from './data.mjs';
import { esc, tbc, icon, sprite, header, footer, head, callBar, serviceMark, dial, BEAT } from './partials.mjs';

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

/* ---------- 1. Departments: white cards slide sideways while the page scrolls down (pinned on desktop) ---------- */
const services = () => `<section id="services" class="depts" aria-labelledby="services-title">
  <div class="depts-pin">
    <div class="wrap depts-head">
      <div class="reveal">
        <p class="eyebrow">Departments</p>
        <h2 id="services-title">${cap(count(SERVICES.length))} departments, one family of doctors</h2>
      </div>
      <div class="depts-side reveal">
        <p class="intro">From a fever to a pregnancy to keyhole surgery, your care stays with the same hospital and the same records.</p>
        <svg class="depts-progress" viewBox="0 0 400 40" preserveAspectRatio="none" fill="none" aria-hidden="true"><path class="dp-base" d="${BEAT}"/><path class="dp-fill" pathLength="1" d="${BEAT}"/></svg>
      </div>
    </div>
    <div class="depts-viewport">
      <ul class="depts-track" role="list">
        ${SERVICES.map((s, i) => `<li class="dcard" style="--i:${i}">
          <a class="dcard-link" href="${R}services/${s.slug}/">
            <span class="dcard-medal">${dial('dcard-dial')}<span class="dcard-face" style="view-transition-name: accent-${s.slug}">${serviceMark(s.kind)}</span></span>
            <span class="dcard-name">${esc(s.name)}</span>
            <span class="dcard-summary">${esc(s.summary)}</span>
            <span class="dcard-cta"><span>Explore the department</span>${icon('i-arrow')}</span>
          </a>
        </li>`).join('')}
      </ul>
    </div>
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

/* ---------- 3. About: two frames at different depths ---------- */
const about = () => `<section id="about" class="section about" aria-labelledby="about-title">
  <div class="wrap about-grid">
    <div class="about-collage">
      <figure class="photo-ph about-photo reveal-mask" style="margin:0">
        <div class="ph-inner" data-parallax=".1" aria-hidden="true"></div>
        <figcaption class="ph-label">${icon('i-image', 'ph-glyph')}<span>Hospital photo to be supplied</span><span class="small">Suggested: the front of the hospital in daylight</span></figcaption>
      </figure>
      <div class="about-float" data-parallax="-.35">
        <figure class="photo-ph about-photo-sm reveal-mask" style="margin:0;--i:2">
          <div class="ph-inner" aria-hidden="true"></div>
          <figcaption class="ph-label"><span class="small">Doctors at work, to be supplied</span></figcaption>
        </figure>
      </div>
      <div class="about-chip reveal" style="--i:3">
        <span class="about-chip-mark">${icon('m-cross')}</span>
        <span><strong>${cap(count(SERVICES.length))} departments</strong><span>under one roof in ${esc(SITE.town)}</span></span>
      </div>
    </div>
    <div class="about-copy">
      <p class="eyebrow reveal">About the hospital</p>
      <h2 id="about-title" class="reveal">A family hospital for ${esc(SITE.town)}</h2>
      <p class="reveal">General physicians and gynaecologists work under one roof, so a mother-to-be, a parent with diabetes and a young couple hoping for a child can all be seen by the right doctor, close to home. Scans, reports and follow-ups stay together at one hospital, from the first consultation to discharge.</p>
      ${FACILITIES.items.length ? `<div class="facilities reveal">
        <h3>Facilities</h3>
        <ul class="facility-list" role="list">${FACILITIES.items.map(f => `<li>${icon('m-cross')}<span>${esc(f)}</span></li>`).join('')}</ul>
        ${FACILITIES.verified ? '' : tbc('List to be verified with the hospital')}
      </div>` : ''}
      <div class="stats" data-stagger>
        ${SITE.stats.map(st => `<div class="stat">
          <span class="stat-value"${st.value != null ? ` data-count="${st.value}" data-suffix="${st.suffix}" data-confirmed="${st.confirmed}"` : ''}>${st.value != null ? Number(st.value).toLocaleString('en-IN') + st.suffix : '&ndash;'}</span>
          <span class="stat-label">${st.label}</span>
          ${st.confirmed ? '' : tbc('To be confirmed')}
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`;

/* ---------- 4. Doctors: a small dial portrait until photos arrive ---------- */
const initials = name => name.replace(/^Dr\.?\s*/, '').split(/\s+/).slice(-2).map(w => w[0]).join('');
const doctorCard = d => {
  const b = BRANCHES.find(x => x.id === d.branch);
  return `<article class="doc">
    <div class="doc-portrait">
      ${dial('doc-dial', 72)}
      <span class="doc-face"><span class="doc-initials" aria-hidden="true">${esc(initials(d.name))}</span></span>
      <span class="doc-photo-note">Photo to be supplied</span>
    </div>
    <div class="doc-body">
      <p class="doc-dept">${esc(d.specialty)}${d.specialtyTbc ? ` ${tbc('To be confirmed', 'tbc-inline')}` : ''}</p>
      <h3 class="doc-name">${esc(d.name)}</h3>
      <p class="doc-qual">${esc(d.qualification)}</p>
      ${d.regNo ? `<p class="doc-reg">Reg. No. ${esc(d.regNo)}</p>` : ''}
      ${d.nameNote ? `<p class="name-note">${tbc(d.nameNote)}</p>` : ''}
      ${d.bio ? `<p class="doc-bio">${esc(d.bio)}</p>` : ''}
      <a class="btn btn-ghost doc-book" href="#contact" data-book-doctor="${esc(d.name)}" data-branch="${b.id}" data-service="${svcFor(d.specialty)}"><span>Book with this doctor</span><span class="visually-hidden">: ${esc(d.name)}</span></a>
    </div>
  </article>`;
};

const doctors = () => `<section id="doctors" class="section doctors" aria-labelledby="doctors-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Consultants and doctors</p>
        <h2 id="doctors-title">The people you will see</h2>
      </div>
      <p class="intro reveal">Choose a doctor here and we will add their name to your appointment request. Photos and short biographies are on the way.</p>
    </div>
    ${BRANCHES.map(b => `<div class="branch-group">
      ${BRANCHES.length > 1 ? `<div class="branch-group-head"><h3>${esc(b.name)}</h3>${b.confirmed ? '' : tbc('Team to be confirmed')}</div>` : ''}
      <div class="doc-grid" data-stagger>${DOCTORS.filter(d => d.branch === b.id && d.name).map(doctorCard).join('')}</div>
    </div>`).join('')}
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
const gallery = () => `<section id="gallery" class="section gallery" aria-labelledby="gallery-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Gallery</p>
        <h2 id="gallery-title">Inside the hospital</h2>
      </div>
      <p class="intro reveal">Photos of the hospital will appear here. Each frame is labelled with the shot we need.</p>
    </div>
    <div class="tabs reveal" role="tablist" aria-label="Filter photos">
      ${GALLERY_TABS.map(([f, l], i) =>
        `<button class="tab" type="button" role="tab" data-filter="${f}" aria-selected="${i === 0}" aria-controls="gallery-grid"${i ? ' tabindex="-1"' : ''}>${l}</button>`).join('')}
      <span class="tab-ink" aria-hidden="true"></span>
    </div>
    <ul id="gallery-grid" class="bento" role="list">
      ${GALLERY.map(([label, cat, size], i) => `<li data-cat="${cat}" class="${size} reveal-mask" style="--i:${i % 4}">
        <button class="g-item" type="button" data-caption="${label}: photo to be supplied" aria-label="Open ${label} placeholder">
          <span class="photo-ph"><span class="ph-inner" aria-hidden="true"></span>
            <span class="ph-label">${icon('i-image', 'ph-glyph')}<span class="small">Photo to be supplied</span></span>
            <strong class="g-caption">${label}</strong>
          </span>
        </button>
      </li>`).join('')}
    </ul>
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
const reviews = () => `<section id="reviews" class="section reviews" aria-labelledby="reviews-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Google reviews</p>
        <h2 id="reviews-title">What patients say</h2>
      </div>
      <p class="intro reveal">In their own words, from the hospital's Google listing.</p>
    </div>
    <div class="reviews-grid">
      <div class="rating reveal">
        <div class="rating-dial">
          ${dial('rating-ring', 72)}
          <div class="rating-face">
            <span class="rating-value">${SITE.rating ?? '&ndash;.&ndash;'}</span>
            ${SITE.rating ? partStars(SITE.rating) : `<span aria-hidden="true">${stars(5, 0)}</span>`}
          </div>
        </div>
        <p>${SITE.rating ? `${SITE.rating} out of 5 from ${SITE.reviewCount} Google reviews` : 'Rating and review count to be confirmed from the Google listing.'}</p>
        ${SITE.googleListing
          ? `<a class="btn btn-ghost" href="${SITE.googleListing}" target="_blank" rel="noopener"><span>Read all ${SITE.reviewCount || ''} reviews on Google</span><span class="visually-hidden"> (opens in a new tab)</span></a>`
          : `<p style="margin:10px 0 0">${tbc('Google listing link to be confirmed')}</p>`}
      </div>
      <div class="carousel reveal" aria-roledescription="carousel" aria-label="Patient reviews">
        <ul class="carousel-track" role="list" tabindex="0" aria-label="Patient reviews, scroll horizontally">
          ${REVIEWS.map((r, i) => `<li aria-roledescription="slide" aria-label="${i + 1} of ${REVIEWS.length}">
            <article class="review">
              <div class="review-head">
                <span class="review-avatar" aria-hidden="true">${esc(r.name.trim()[0].toUpperCase())}</span>
                <span class="review-who"><span class="review-name">${esc(r.name)}</span><span class="review-src">Google review</span></span>
              </div>
              <span role="img" aria-label="5 out of 5 stars">${stars(5, 5)}</span>
              <blockquote>${r.text.split(/\n+/).map(t => `<p>${esc(t)}</p>`).join('')}</blockquote>
            </article>
          </li>`).join('')}
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

/* ---------- 8. Book an appointment: one short form, with the phone beside it ---------- */
const svcFor = specialty => SERVICES.find(s => s.name === specialty)?.slug || '';
const contact = () => `<section id="contact" class="section book" aria-labelledby="contact-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">Appointments</p>
        <h2 id="contact-title">Book an appointment</h2>
      </div>
      <p class="intro reveal">Send a request and we will email you as soon as the hospital confirms your appointment.</p>
    </div>
    <div class="book-grid">
      <form id="appointment-form" class="book-form reveal" action="#" method="post" aria-describedby="form-note" ${bookingAttrs()}>
        <div class="form-grid">
          <div class="field"><label for="f-name">Your name <span class="req">(required)</span></label><input id="f-name" name="name" autocomplete="name" required aria-describedby="e-name"><span class="error" id="e-name" aria-live="polite"></span></div>
          <div class="field"><label for="f-phone">Phone number <span class="req">(required)</span></label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="e-phone"><span class="error" id="e-phone" aria-live="polite"></span></div>
          <div class="field"><label for="f-email">Email <span class="req">(for your confirmation)</span></label><input id="f-email" name="email" type="email" inputmode="email" autocomplete="email" required aria-describedby="e-email"><span class="error" id="e-email" aria-live="polite"></span></div>
          <div class="field date-field"><label for="f-date">Preferred day <span class="req">(Mon to Sat)</span></label><input id="f-date" name="date" type="date" required aria-describedby="e-date"><span class="error" id="e-date" aria-live="polite"></span></div>
          <div class="field"><label for="f-service">Department <span class="req">(optional)</span></label><select id="f-service" name="service"><option value="">Not sure yet</option>${SERVICES.map(s => `<option value="${s.slug}">${esc(s.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="f-msg">Anything we should know? <span class="req">(optional)</span></label><input id="f-msg" name="message" placeholder="For example: fever for three days"></div>
          <fieldset class="field field-full slot-field" aria-describedby="e-time">
            <legend>Preferred time <span class="req">(${BOOKING.slotMinutes}-minute appointments)</span></legend>
            ${BOOKING.sessions.map(sess => `<div class="slot-group">
              <p class="slot-session"><strong>${sess[0]}</strong> ${timeLabel(sess[1])} to ${timeLabel(sess[2])}</p>
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
          <p class="small book-note" id="form-note">This is a request, not a confirmed appointment. You will get an email once the hospital confirms it.</p>
        </div>
        <div id="form-status" class="form-status" role="status" tabindex="-1" hidden></div>
      </form>

      <aside class="book-call reveal" aria-labelledby="book-call-title">
        <h3 id="book-call-title">Prefer to call?</h3>
        <p>Reception will book you in over the phone.</p>
        ${PRIMARY.phone ? `<a class="book-call-main" href="tel:${PRIMARY.tel}">${icon('i-phone')}<span>${PRIMARY.phone}</span></a>` : ''}
        ${PRIMARY.mobiles?.length ? `<div class="book-call-alts">${PRIMARY.mobiles.map(m => `<a class="book-call-alt" href="tel:${m.tel}">${m.phone}</a>`).join('')}</div>` : ''}
        <p class="book-emergency"><strong>Emergency?</strong> Call <a href="tel:${EMERGENCY.national}">${EMERGENCY.national}</a>${EMERGENCY.tel ? ` or <a href="tel:${EMERGENCY.tel}">${EMERGENCY.phone}</a>` : ''} or go to the nearest emergency department. Do not use this form.</p>
      </aside>
    </div>
  </div>
</section>`;

/* Shared by both booking forms: where requests go, and the fields people never see */
const bookingAttrs = () => `data-booking${BOOKING.endpoint ? ` data-endpoint="${esc(BOOKING.endpoint)}"` : ''} data-fallback="${esc(`Online booking is not connected yet, so this request has not been sent. To book now, call reception on ${PRIMARY.phone}.`)}"`;
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
        <p>Leave your details. We will email you once the hospital confirms a time.</p>
      </div>
    </div>
    <form class="pop-form" action="#" method="post" ${bookingAttrs()}>
      <div class="field"><label for="p-name">Your name</label><input id="p-name" name="name" autocomplete="name" required aria-describedby="pe-name"><span class="error" id="pe-name" aria-live="polite"></span></div>
      <div class="field"><label for="p-phone">Phone number</label><input id="p-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="pe-phone"><span class="error" id="pe-phone" aria-live="polite"></span></div>
      <div class="field"><label for="p-email">Email</label><input id="p-email" name="email" type="email" inputmode="email" autocomplete="email" required aria-describedby="pe-email"><span class="error" id="pe-email" aria-live="polite"></span></div>
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

/* ---------- 9. FAQ ---------- */
const FAQ = [
  ['How do I book an appointment?', `<p>Call reception on <a href="tel:${PRIMARY.tel}">${PRIMARY.phone}</a>${PRIMARY.mobiles?.length ? ` or ${PRIMARY.mobiles.map(m => `<a href="tel:${m.tel}">${m.phone}</a>`).join(' or ')}` : ''}, or send a request with the form above and we will call you back to confirm a time.</p>${PRIMARY.hours ? `<p>OPD timings${PRIMARY.days ? `, ${PRIMARY.days}` : ''}: ${PRIMARY.hours.map(([d, h]) => `${d.toLowerCase()} ${h}`).join(', ')}.${PRIMARY.days ? ' OPD is closed on Sunday.' : ''}</p>` : ''}<p>${tbc('Call-back times to be confirmed')}</p>`],
  ['What happens at my first visit?', `<p>The doctor asks about your concern and your medical history, examines you, and may suggest blood tests, an ECG or a scan. You will hear what we found and the options before any treatment begins.</p><p>${tbc('Draft, to be confirmed by the hospital')}</p>`],
  ['What should I bring?', `<p>An ID proof, any earlier reports, scans and prescriptions, a list of medicines you take, and your insurance card if you have one. In pregnancy, bring your antenatal card and all scan reports.</p><p>${tbc('Draft, to be confirmed by the hospital')}</p>`],
  ['How can I pay?', `<p>Accepted payment methods ${tbc('to be confirmed with client', 'tbc-inline')}</p><p>Insurance, cashless and government scheme options ${tbc('to be confirmed with client', 'tbc-inline')}</p>`],
  ['What should I do in an emergency?', `<p>For chest pain, sudden weakness of the face or arm, trouble breathing, a fit, heavy bleeding, or bleeding or severe pain in pregnancy, call <a href="tel:${EMERGENCY.national}">${EMERGENCY.national}</a> for an ambulance or go to the nearest emergency department straight away.</p><p>${EMERGENCY.available24h ? `Our emergency department is open 24 hours, every day, including Sundays and holidays.${EMERGENCY.tel ? ` Call the hospital any time on <a href="tel:${EMERGENCY.tel}">${EMERGENCY.phone}</a>.` : ` ${tbc('Emergency phone number to be confirmed', 'tbc-inline')}`}` : tbc('Casualty hours and emergency number to be confirmed')}</p>`],
  ['What are the visiting hours?', `<p>${tbc('Visiting hours and the number of attendants allowed to be confirmed')}</p>`],
  ['Will the scan tell us whether the baby is a boy or a girl?', `<p>No. Telling the sex of an unborn baby is against the law in India under the PC &amp; PNDT Act, and it is not done at this hospital. Scans in pregnancy check the baby's growth, position and well-being.</p>`],
  ['Which doctor should I see?', `<p>For fever, sugar, thyroid, blood pressure, breathing or kidney problems, see a general physician. For pregnancy, periods, PCOD or difficulty conceiving, see a gynaecologist. If you are not sure, call reception and we will guide you.</p>`]
];
export const accordion = (items, prefix) => `<div class="accordion">${items.map(([q, a], i) => `<div class="acc-item">
  <h3><button class="acc-btn" type="button" aria-expanded="false" aria-controls="${prefix}-${i}" id="${prefix}-q${i}">${esc(q)}<span class="plus" aria-hidden="true"></span></button></h3>
  <div class="acc-panel" id="${prefix}-${i}" role="region" aria-labelledby="${prefix}-q${i}"><div class="acc-inner">${a}</div></div>
</div>`).join('')}</div>`;

const faq = () => `<section id="faq" class="section faq" aria-labelledby="faq-title">
  <div class="wrap faq-grid">
    <div class="section-head">
      <div class="reveal">
        <p class="eyebrow">FAQ</p>
        <h2 id="faq-title">Before you visit</h2>
      </div>
      <p class="intro reveal">Answers marked "to be confirmed" are waiting on details from the hospital.</p>
    </div>
    ${accordion(FAQ, 'faq')}
  </div>
</section>`;

export const landing = () => `<!doctype html>
<html lang="en" class="no-js">
<head>
${head({ title: `${SITE.name} | ${SITE.town}`, description: `${SERVICES.map(s => s.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} at ${SITE.name}, ${SITE.town}.`, R, extraCss: ['home.css'] })}
</head>
<body class="home">
${sprite()}
${header(R)}
<main id="main">
${heroSlot()}
${services()}
${approach()}
${about()}
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

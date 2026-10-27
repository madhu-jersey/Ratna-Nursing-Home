/* Ratna Nursing Home: site interactions.
   Everything here is progressive: the page is complete and readable without it. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionOK = () => !reduce.matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Smooth scrolling (desktop, motion allowed, library loaded) ---------- */
  let lenis = null;
  if (window.Lenis && motionOK() && finePointer.matches) {
    lenis = new window.Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const loop = t => { lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    // In-page links glide too, landing just under the header
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href*="#"]');
      if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
      const target = a.hash.length > 1 && document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -84 });
      history.pushState(null, '', a.hash);
    });
  }

  /* ---------- Header: a shadow once the page moves; hides going down, returns going up ---------- */
  const siteHeader = $('.site-header');
  if (siteHeader) {
    let lastY = scrollY, ticking = false;
    const onScroll = () => {
      ticking = false;
      const y = scrollY;
      siteHeader.classList.toggle('is-scrolled', y > 8);
      const menuOpen = $('.nav-toggle')?.getAttribute('aria-expanded') === 'true';
      if (!menuOpen && !siteHeader.contains(document.activeElement)) siteHeader.classList.toggle('is-hidden', y > 480 && y > lastY + 2);
      if (y < lastY - 2 || y <= 480) siteHeader.classList.remove('is-hidden');
      lastY = y;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    siteHeader.addEventListener('focusin', () => siteHeader.classList.remove('is-hidden'));
    onScroll();
  }

  /* ---------- Mobile nav ---------- */
  const toggle = $('.nav-toggle');
  const mobileNav = $('#mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener('click', e => {
      if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); mobileNav.hidden = true; }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !mobileNav.hidden) { toggle.setAttribute('aria-expanded', 'false'); mobileNav.hidden = true; toggle.focus(); }
    });
  }

  /* ---------- Scroll spy for the landing nav ---------- */
  const navLinks = $$('.nav-list a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => a.removeAttribute('aria-current'));
        byId.get(en.target.id)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---------- Reveals: headings rise, cards stagger ---------- */
  if (motionOK() && 'IntersectionObserver' in window) {
    root.classList.add('motion');
    $$('[data-stagger]').forEach(group => {
      [...group.children].forEach((child, i) => { child.classList.add('reveal'); child.style.setProperty('--i', i); });
    });
    // Section headings: wrap each word so it can rise out of its own mask
    $$('.section-head h2, .cta-band h2, .about-copy h2, .contact-copy h2').forEach(h => {
      if (h.children.length) return; // only plain-text headings
      const words = h.textContent.trim().split(/\s+/);
      h.textContent = '';
      words.forEach((word, i) => {
        const w = document.createElement('span'); w.className = 'w';
        const inner = document.createElement('span'); inner.textContent = word; inner.style.setProperty('--wi', i);
        w.appendChild(inner); h.appendChild(w);
        if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
      });
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('is-in'); io.unobserve(el);
        // hand transform back to the element (e.g. hover lift) once the entrance is done
        if (el.classList.contains('reveal')) {
          const i = parseFloat(el.style.getPropertyValue('--i')) || 0, words = el.querySelectorAll('.w').length;
          setTimeout(() => { el.classList.remove('reveal', 'is-in'); el.style.removeProperty('--i'); }, Math.max(i * 80 + 1200, words * 45 + 1300));
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .06 });
    $$('.statement-beat').forEach(el => el.classList.add('reveal-draw'));
    $$('.reveal, .reveal-mask, .reveal-draw').forEach(el => io.observe(el));
  }

  /* ---------- Departments: on wide screens the section pins and the cards travel sideways with scroll ---------- */
  const depts = $('.depts'), track = $('.depts-track');
  if (depts && track) {
    const wide = matchMedia('(min-width: 960px)');
    const fill = $('.dp-fill', depts);
    if (motionOK() && 'IntersectionObserver' in window) {
      const dio = new IntersectionObserver(([en]) => { if (en.isIntersecting) { depts.classList.add('is-in'); dio.disconnect(); } }, { threshold: .15 });
      dio.observe(depts);
    } else depts.classList.add('is-in');
    let travel = 0, pinned = false, queued = false;
    const paint = () => {
      queued = false;
      if (!pinned) return;
      const p = Math.min(1, Math.max(0, -depts.getBoundingClientRect().top / travel));
      track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px, 0, 0)`;
      if (fill) fill.style.strokeDashoffset = (1 - p).toFixed(3);
    };
    const measure = () => {
      pinned = wide.matches && motionOK();
      depts.classList.toggle('is-pinned', pinned);
      if (!pinned) { depts.style.height = ''; track.style.transform = ''; if (fill) fill.style.strokeDashoffset = ''; return; }
      travel = Math.max(1, track.scrollWidth - innerWidth);
      depts.style.height = `${innerHeight + travel}px`;
      paint();
    };
    addEventListener('scroll', () => { if (pinned && !queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener('resize', measure);
    wide.addEventListener('change', measure);
    document.fonts?.ready.then(measure);
    measure();
  }

  /* ---------- How we treat you: the step in the middle of the screen lights up; the rail fills behind it ---------- */
  const flow = $('.steps-wrap');
  if (flow && motionOK() && 'IntersectionObserver' in window) {
    const steps = $$('.flow-step', flow), railFill = $('.flow-fill', flow);
    const sio = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const i = steps.indexOf(en.target);
      steps.forEach((st, j) => st.classList.toggle('is-active', j === i));
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(st => sio.observe(st));
    let queued = false;
    const paint = () => {
      queued = false;
      const r = flow.getBoundingClientRect();
      railFill.style.setProperty('--fill', Math.min(1, Math.max(0, (innerHeight / 2 - r.top) / r.height)).toFixed(3));
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();
  } else $$('.flow-step').forEach(st => st.classList.add('is-active'));

  /* ---------- Parallax (transform only, only while visible) ---------- */
  const parallaxEls = $$('[data-parallax]');
  // Desktop only: on phones, moving pictures against a touch scroll feels jumpy and costs battery
  if (parallaxEls.length && motionOK() && matchMedia('(min-width: 760px)').matches) {
    const visible = new Set();
    const pio = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)), { rootMargin: '20% 0px' });
    parallaxEls.forEach(el => pio.observe(el));
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = innerHeight;
      visible.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around centre
        el.style.setProperty('--py', `${(progress * parseFloat(el.dataset.parallax) * 100).toFixed(1)}px`);
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Hero: the dial drifts a little toward the pointer ---------- */
  const hero = $('.hero'), seal = $('.hero-seal');
  if (hero && seal && finePointer.matches && motionOK()) {
    let raf = 0;
    hero.addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        seal.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
        seal.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
      });
    });
    hero.addEventListener('pointerleave', () => { seal.style.setProperty('--px', 0); seal.style.setProperty('--py', 0); });
  }

  /* ---------- Magnetic primary buttons (desktop) ---------- */
  if (finePointer.matches && motionOK()) {
    $$('[data-magnetic]').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', `${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px`);
        btn.style.setProperty('--by', `${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px`);
      });
      btn.addEventListener('pointerleave', () => { btn.style.setProperty('--bx', '0px'); btn.style.setProperty('--by', '0px'); });
    });
  }

  /* ---------- Counters: animate only numbers the client has confirmed ---------- */
  $$('[data-count]').forEach(el => {
    if (el.dataset.confirmed !== 'true') return;
    const target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
    const fmt = n => Math.round(n).toLocaleString('en-IN') + suffix;
    if (!motionOK()) { el.textContent = fmt(target); return; }
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const step = t => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: .6 });
    io.observe(el);
  });

  /* ---------- FAQ accordion ---------- */
  $$('.acc-btn').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    const set = open => {
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      panel.inert = !open;
    };
    set(btn.getAttribute('aria-expanded') === 'true');
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  });

  /* ---------- Gallery: tabs ---------- */
  const tabs = $$('.gallery .tab');
  const items = $$('#gallery-grid > li');
  if (tabs.length) {
    const ink = $('.gallery .tab-ink');
    const moveInk = tab => {
      if (!ink) return;
      ink.style.width = `${tab.offsetWidth}px`; ink.style.height = `${tab.offsetHeight}px`;
      ink.style.translate = `${tab.offsetLeft}px ${tab.offsetTop}px`;
    };
    addEventListener('resize', () => moveInk(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]));
    document.fonts?.ready.then(() => moveInk(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]));
    moveInk(tabs[0]);
    const select = tab => {
      moveInk(tab);
      tabs.forEach(t => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      const cat = tab.dataset.filter;
      items.forEach(li => { li.hidden = cat !== 'all' && li.dataset.cat !== cat; });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus(); select(next);
      });
    });
  }

  /* ---------- Gallery: lightbox ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const stage = $('.lb-stage', lb), cap = $('.lb-text', lb), count = $('.lb-count', lb);
    let list = [], idx = 0, lastFocus = null;
    const visibleItems = () => items.filter(li => !li.hidden).map(li => $('.g-item', li));
    const show = i => {
      idx = (i + list.length) % list.length;
      const src = list[idx];
      stage.innerHTML = $('.photo-ph', src).outerHTML;
      cap.textContent = src.dataset.caption;
      count.textContent = `${idx + 1} of ${list.length}`;
    };
    const open = btn => {
      list = visibleItems(); lastFocus = btn;
      show(list.indexOf(btn));
      lb.hidden = false;
      document.body.style.overflow = 'hidden'; lenis?.stop();
      requestAnimationFrame(() => lb.classList.add('is-open'));
      $('.lb-close', lb).focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      document.body.style.overflow = ''; lenis?.start();
      setTimeout(() => { lb.hidden = true; }, motionOK() ? 300 : 0);
      lastFocus?.focus();
    };
    $$('.g-item').forEach(b => b.addEventListener('click', () => open(b)));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    lb.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'Tab') { // keep focus inside the dialog
        const f = $$('button', lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    let sx = 0, sy = 0;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Review carousel: drag with momentum, auto-advance, pause on hover ---------- */
  $$('.carousel').forEach(car => {
    const track = $('.carousel-track', car);
    const prev = $('[data-dir="-1"]', car), next = $('[data-dir="1"]', car);
    const pauseBtn = $('.carousel-pause', car), status = $('.carousel-status', car);
    const slides = [...track.children];
    const stepSize = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16);
    const go = dir => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (dir > 0 && track.scrollLeft >= max) track.scrollTo({ left: 0 });
      else track.scrollBy({ left: dir * stepSize() });
    };
    prev?.addEventListener('click', () => go(-1));
    next?.addEventListener('click', () => go(1));
    const updateStatus = () => {
      const i = Math.round(track.scrollLeft / stepSize());
      if (status) status.textContent = `${Math.min(i + 1, slides.length)} of ${slides.length}`;
    };
    track.addEventListener('scroll', () => requestAnimationFrame(updateStatus), { passive: true });
    updateStatus();

    // Mouse drag with momentum (touch already has native momentum)
    let down = false, lastX = 0, lastT = 0, vel = 0, glide = 0;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; lastX = e.clientX; lastT = performance.now(); vel = 0; cancelAnimationFrame(glide);
      track.classList.add('is-dragging');
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const now = performance.now(), dx = e.clientX - lastX;
      track.scrollLeft -= dx; vel = dx / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      let v = vel * 16;
      const decay = () => {
        if (Math.abs(v) < .5 || !motionOK()) { track.classList.remove('is-dragging'); return; }
        track.scrollLeft -= v; v *= .94; glide = requestAnimationFrame(decay);
      };
      decay();
    });

    // Auto-advance: off for reduced motion, pauses on hover, focus, off-screen, or by the button
    if (!motionOK() || !pauseBtn) { if (pauseBtn) pauseBtn.hidden = true; return; }
    let userPaused = false, hover = false, onScreen = false, timer = 0;
    const tick = () => { if (!userPaused && !hover && onScreen && !document.hidden) go(1); };
    const start = () => { clearInterval(timer); timer = setInterval(tick, 6000); };
    car.addEventListener('pointerenter', () => hover = true);
    car.addEventListener('pointerleave', () => hover = false);
    car.addEventListener('focusin', () => hover = true);
    car.addEventListener('focusout', () => hover = false);
    new IntersectionObserver(([en]) => onScreen = en.isIntersecting, { threshold: .4 }).observe(car);
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Resume automatic scrolling' : 'Pause automatic scrolling');
      $('.i-pause', pauseBtn).hidden = userPaused; $('.i-play', pauseBtn).hidden = !userPaused;
    });
    start();
  });

  /* ---------- "Book with this doctor" prefills the form, department included ---------- */
  $$('[data-book-doctor]').forEach(a => a.addEventListener('click', () => {
    const form = $('#appointment-form');
    if (!form) return;
    const msg = form.elements.message, branch = form.elements.branch;
    if (branch && a.dataset.branch) branch.value = a.dataset.branch;
    if (form.elements.service && a.dataset.service) form.elements.service.value = a.dataset.service;
    if (msg && !msg.value) msg.value = `I would like to book with ${a.dataset.bookDoctor}.`;
  }));

  /* ---------- Booking forms (the section and the popup): validate, then send to the hospital's booking service ---------- */
  const store = (kind, key, val) => { try { return val === undefined ? window[kind].getItem(key) : window[kind].setItem(key, val); } catch { return null; } };
  const checks = {
    name: v => v.trim().length >= 2 || 'Enter your name.',
    phone: v => /^[+\d][\d\s-]{8,15}$/.test(v.trim()) || 'Enter a 10-digit mobile number.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter an email address, like name@gmail.com.',
    branch: v => !!v || 'Choose a branch.',
    // Day and time are required and must fall within OPD: Monday to Saturday, and not already past
    date: v => !v ? 'Choose a day for your appointment.' : v < todayISO() ? 'Choose today or a later day.' : new Date(v + 'T00:00').getDay() === 0 ? 'OPD is closed on Sunday. Choose Monday to Saturday.' : true,
    time: (v, form) => !v ? 'Choose a time for your appointment.' : form.elements.date?.value !== todayISO() || v > nowHHMM() || 'That time has already passed today. Choose a later time.'
  };
  const pad = n => String(n).padStart(2, '0');
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const nowHHMM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  $$('form[data-booking]').forEach(form => {
    form.setAttribute('novalidate', '');
    const statusEl = $('.form-status', form), btn = $('button[type="submit"]', form), label = $('.submit-label', btn);
    const fields = Object.keys(checks).filter(n => form.elements[n] && form.elements[n].type !== 'hidden');
    // A radio group (the time slots) arrives as a RadioNodeList: report on its fieldset, focus its first option
    const first = n => { const el = form.elements[n]; return el instanceof RadioNodeList ? el[0] : el; };
    const validate = n => {
      const el = form.elements[n], res = checks[n](el.value, form), ok = res === true, box = first(n).closest('.field');
      box?.classList.toggle('has-error', !ok);
      if (!(el instanceof RadioNodeList)) el.setAttribute('aria-invalid', String(!ok));
      const err = box && $('.error', box); if (err) err.textContent = ok ? '' : res;
      return ok;
    };
    ['name', 'phone', 'email', 'branch'].filter(n => fields.includes(n)).forEach(n => form.elements[n].addEventListener('blur', () => { if (form.elements[n].value) validate(n); }));

    // Slots already gone today are struck through and cannot be picked
    const dateEl = form.elements.date;
    if (dateEl) dateEl.min = todayISO();
    const syncSlots = () => {
      const isToday = dateEl?.value === todayISO(), now = nowHHMM();
      $$('[name="time"], [name="time"] option', form).forEach(o => {
        if (!o.value || o.tagName === 'SELECT') return;
        o.disabled = isToday && o.value <= now;
        if (o.disabled && (o.checked || o.selected)) { o.checked = false; if (o.selected) o.closest('select').value = ''; }
      });
    };
    form.addEventListener('change', e => {
      if (e.target.name === 'date') { syncSlots(); validate('date'); if (form.elements.time?.value) validate('time'); }
      if (e.target.name === 'time') validate('time');
    });
    form.addEventListener('reset', () => setTimeout(syncSlots));
    const say = (text, kind, title) => {
      statusEl.hidden = false; statusEl.textContent = '';
      if (title) { const t = document.createElement('strong'); t.className = 'status-title'; t.textContent = title; statusEl.append(t); }
      statusEl.append(text);
      statusEl.classList.toggle('is-ok', kind === 'ok'); statusEl.classList.toggle('is-error', kind === 'error');
      statusEl.focus();
    };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const bad = fields.filter(n => !validate(n));
      if (bad.length) { first(bad[0]).focus(); return; }
      const endpoint = form.dataset.endpoint;
      if (!endpoint) { say(form.dataset.fallback, 'error'); return; }
      btn.disabled = true; btn.classList.add('is-busy'); if (label) label.textContent = 'Sending your request';
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
        const data = await res.json();
        if (!data.ok) throw new Error((data.errors || []).join(', ') || 'rejected');
        const firstName = form.elements.name.value.trim().split(/\s+/)[0];
        form.reset();
        store('sessionStorage', 'rnh-booked', '1');
        say('We will email you as soon as the hospital confirms your appointment.', 'ok', `Thank you, ${firstName}. Your request is sent.`);
        form.dispatchEvent(new CustomEvent('booking:sent', { bubbles: true }));
      } catch {
        say(`Your request could not be sent. Please try again, or call reception on ${$('.book-call-main span')?.textContent || 'the hospital'}.`, 'error');
      } finally {
        btn.disabled = false; btn.classList.remove('is-busy'); if (label) label.textContent = 'Request appointment';
      }
    });
  });

  /* ---------- Booking popup: once per visit, after a while on the page, never over something the visitor is doing ---------- */
  const pop = $('#book-pop');
  if (pop) {
    const card = $('.pop-card', pop);
    let lastFocus = null, closeTimer = 0;
    const focusables = () => $$('button, a[href], input:not([type="hidden"]):not([tabindex="-1"]), select, textarea', card).filter(el => !el.closest('[hidden]'));
    const open = () => {
      store('sessionStorage', 'rnh-pop', '1');
      lastFocus = document.activeElement;
      pop.hidden = false; document.body.style.overflow = 'hidden'; lenis?.stop();
      void pop.offsetWidth; // commit the closed state first so the entrance transition runs
      pop.classList.add('is-open');
      setTimeout(() => $('#p-name', pop)?.focus({ preventScroll: true }), motionOK() ? 450 : 0);
    };
    const close = () => {
      pop.classList.remove('is-open');
      document.body.style.overflow = ''; lenis?.start();
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => { pop.hidden = true; }, motionOK() ? 500 : 0);
      lastFocus?.focus?.({ preventScroll: true });
    };
    $$('[data-pop-close]', pop).forEach(el => el.addEventListener('click', close));
    pop.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      else if (e.key === 'Tab') {
        const f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    pop.addEventListener('booking:sent', () => { closeTimer = setTimeout(close, 6000); });

    // Shown once per visit, a moment after the visitor scrolls past the top of the page; not again in a visit where they booked
    if (!store('sessionStorage', 'rnh-pop') && !store('sessionStorage', 'rnh-booked')) {
      const section = $('#contact');
      let sectionInView = false;
      if (section && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => { sectionInView = en.isIntersecting; }).observe(section);
      const busy = () => sectionInView || document.hidden || !$('#lightbox')?.hidden || $('.nav-toggle')?.getAttribute('aria-expanded') === 'true'
        || (document.activeElement && document.activeElement.matches('input, select, textarea'));
      const after = () => (Number(pop.dataset.scroll) || .5) * innerHeight;
      let timer = 0;
      const onScroll = () => {
        if (timer || scrollY < after()) return;
        // wait for the scrolling to settle, then open unless the visitor is busy (the next scroll tries again)
        timer = setTimeout(() => {
          timer = 0;
          if (busy() || store('sessionStorage', 'rnh-booked')) return;
          removeEventListener('scroll', onScroll);
          open();
        }, (Number(pop.dataset.delay) || 1.5) * 1000);
      };
      addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /* ---------- Find us: copy the address ---------- */
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const label = $('.copy-label', btn), status = btn.closest('.visit-info')?.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.classList.add('is-copied'); if (label) label.textContent = 'Address copied';
      if (status) status.textContent = 'Address copied to the clipboard.';
    } catch {
      if (label) label.textContent = 'Copy failed: select the address above';
    }
    setTimeout(() => { btn.classList.remove('is-copied'); if (label) label.textContent = 'Copy address'; }, 2600);
  }));

  /* ---------- Mobile sticky "Call now" ---------- */
  const callBar = $('.call-bar');
  if (callBar) {
    const show = () => callBar.classList.toggle('is-visible', scrollY > 320);
    addEventListener('scroll', show, { passive: true }); show();
  }

})();

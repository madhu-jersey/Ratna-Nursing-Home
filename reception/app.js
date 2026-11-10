// Ratna Nursing Home: reception app. One screen for waiting bookings and every doctor's week.
// Everything loads in one request to the booking service, so tabs, days and bookings open instantly;
// approvals show at once and save in the background.
(() => {
  'use strict';
  const ENDPOINT = document.documentElement.dataset.endpoint;
  const $ = (s, el = document) => el.querySelector(s);
  const main = $('#main');
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* private mode: works, just not remembered */ } }
  };

  /* ---------- State ---------- */
  const state = {
    pin: store.get('rnh-pin') || '',
    data: (() => { try { return JSON.parse(store.get('rnh-feed') || 'null'); } catch { return null; } })(),
    syncing: false, syncedAt: Number(store.get('rnh-feed-at') || 0), offline: false,
    fresh: new Set(),        // bookings that arrived since the app was opened
    deciding: new Map(),     // id -> decision on its way to the booking service
    results: new Map(),      // id -> what the result screen shows
    pick: {},                // the approval choices on the open booking
    pinError: ''
  };

  /* ---------- Small helpers ---------- */
  const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pad = n => String(n).padStart(2, '0');
  const tl = t => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${(h + 11) % 12 + 1}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`; };
  const utc = iso => new Date(iso + 'T12:00:00Z');
  const addDays = (iso, n) => { const d = utc(iso); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const fmt = (iso, o) => utc(iso).toLocaleDateString('en-GB', { timeZone: 'UTC', ...o });
  const today = () => state.data?.today || new Date().toISOString().slice(0, 10);
  const dayLabel = iso => {
    if (!iso) return 'No day given';
    const n = Math.round((utc(iso) - utc(today())) / 864e5);
    return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n === -1 ? 'Yesterday' : fmt(iso, { weekday: 'short', day: 'numeric', month: 'short' });
  };
  const longDate = iso => `${fmt(iso, { weekday: 'long' })}, ${fmt(iso, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const isSunday = iso => utc(iso).getUTCDay() === 0;
  const nowHHMM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const slotsOf = ([, a, b]) => {
    const step = state.data?.slotMinutes || 30, out = [];
    const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    for (let m = toMin(a); m + step <= toMin(b); m += step) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    return out;
  };
  const colorOf = name => state.data?.doctors.find(d => d.name === name)?.color || '#4F5B74';
  const waUrl = (phone, text) => {
    let n = String(phone || '').replace(/\D/g, '');
    if (n.length === 11 && n[0] === '0') n = n.slice(1);
    if (n.length === 10) n = '91' + n;
    return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  };
  const confirmText = (b, date, t, doctor) => {
    const h = state.data.hospital;
    return `Hello ${b.name}, your appointment at ${h.name} is confirmed for ${longDate(date)}, ${tl(t)}${doctor ? ` with ${doctor}` : ''}.\nAddress: ${h.address}.\nPlease bring any earlier reports and prescriptions. To change or cancel, reply here or call ${h.phone}.`;
  };
  const declineText = (b, reason) => {
    const h = state.data.hospital;
    return `Hello ${b.name}, we are not able to confirm your appointment request as sent.${reason ? ` ${reason}` : ''} Please reply here or call ${h.phone} and we will find a time that works.`;
  };
  const ago = ms => { const s = Math.round((Date.now() - ms) / 1000); return s < 45 ? 'just now' : s < 90 ? 'a minute ago' : s < 3600 ? `${Math.round(s / 60)} minutes ago` : `at ${new Date(ms).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`; };

  const I = (() => {
    const i = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    return {
      phone: i('<path d="M5 3.5h3.2l1.6 4.2-2 1.3a11 11 0 0 0 7.2 7.2l1.3-2 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5z"/>'),
      wa: i('<path d="M4.6 19.4l1.1-3.4a8 8 0 1 1 2.8 2.6z"/><path d="M9.3 8.6c.3-.4.7-.5 1-.4l.9 2-.6.8a5.6 5.6 0 0 0 2.4 2.4l.8-.6 2 .9c.1.3 0 .7-.4 1-.8.4-2 .3-3.4-.6a9.2 9.2 0 0 1-3-3c-.9-1.4-1-2.6-.7-3.5z"/>'),
      tick: i('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
      cross: i('<path d="M6 6l12 12M18 6 6 18"/>'),
      lock: i('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
      next: i('<path d="M9.5 6l6 6-6 6"/>'),
      back: i('<path d="M14.5 6 8.5 12l6 6"/>'),
      refresh: i('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>'),
      wifi: i('<path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0"/><path d="M3 3l18 18"/>')
    };
  })();

  /* ---------- Talking to the booking service ---------- */
  const api = async params => {
    const res = await fetch(ENDPOINT, { method: 'POST', body: new URLSearchParams({ ...params, pin: state.pin }) });
    return res.json();
  };
  const pinProblem = err => err === 'pin' ? 'That PIN is not right. Try again.' : err === 'locked' ? 'Too many wrong PINs. Wait 15 minutes, then try again.' : err === 'nopin' ? 'The reception PIN is not set up yet. Add RECEPTION_PIN in Apps Script, Script properties.' : '';

  // Bookings decided on this phone but not yet saved stay out of the list, and their times stay held
  const applyLocal = data => {
    state.deciding.forEach((d, id) => {
      data.pending = data.pending.filter(b => b.id !== id);
      if (d.kind === 'approve') addToWeek(data, d);
    });
    return data;
  };
  const addToWeek = (data, d) => {
    const day = (data.schedule[d.date] = data.schedule[d.date] || {}), list = (day[d.doctor] = day[d.doctor] || []);
    if (!list.some(e => e.t === d.t && e.name === d.b.name)) { list.push({ t: d.t, name: d.b.name, dept: d.b.department, phone: d.b.phone }); list.sort((a, b) => a.t < b.t ? -1 : 1); }
    const tk = (data.taken[d.date] = data.taken[d.date] || {}), doc = (tk[d.doctor] = tk[d.doctor] || {});
    doc[d.t] = (doc[d.t] || 0) + 1;
  };

  let syncTimer = null;
  const sync = async ({ quiet } = {}) => {
    if (state.syncing || !state.pin) return;
    state.syncing = true; paintBar();
    try {
      const data = await api({ api: 'sync' });
      if (!data.ok) {
        const msg = pinProblem(data.error);
        if (msg) { lock(msg); return; }
        throw new Error(data.error || 'failed');
      }
      const before = new Set((state.data?.pending || []).map(b => b.id));
      if (state.data) data.pending.forEach(b => { if (!before.has(b.id)) state.fresh.add(b.id); });
      const arrived = state.data && data.pending.some(b => !before.has(b.id));
      state.data = applyLocal(data);
      state.syncedAt = Date.now(); state.offline = false;
      store.set('rnh-pin', state.pin);
      store.set('rnh-feed', JSON.stringify(data)); store.set('rnh-feed-at', String(state.syncedAt));
      if (arrived) { try { navigator.vibrate?.(120); } catch { /* not on every phone */ } }
      render({ keepScroll: true, quiet });
    } catch {
      state.offline = true;
      render({ keepScroll: true, quiet: true });
    } finally {
      state.syncing = false; paintBar();
    }
  };
  const scheduleSync = () => { clearInterval(syncTimer); syncTimer = setInterval(() => { if (document.visibilityState === 'visible') sync({ quiet: true }); }, 45000); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - state.syncedAt > 15000) sync({ quiet: true }); });
  addEventListener('online', () => sync({ quiet: true }));

  const lock = msg => {
    state.pin = ''; state.pinError = msg || '';
    store.set('rnh-pin', null); store.set('rnh-feed', null); store.set('rnh-feed-at', null);
    state.data = null; state.fresh.clear();
    go('', true);
  };

  /* ---------- Routing: the phone's back button works like any app ---------- */
  const route = () => {
    const h = location.hash.slice(1);
    if (h.startsWith('b/')) return { view: 'booking', id: decodeURIComponent(h.slice(2)) };
    if (h.startsWith('done/')) return { view: 'done', id: decodeURIComponent(h.slice(5)) };
    if (h.startsWith('schedule')) return { view: 'schedule', day: h.split('/')[1] || '' };
    return { view: 'waiting' };
  };
  const go = (hash, replace) => {
    const url = hash ? `#${hash}` : location.pathname;
    if (replace) history.replaceState(history.state, '', url); else history.pushState(null, '', url);
    render();
  };
  addEventListener('popstate', () => render());

  /* ---------- Drawing ---------- */
  const bar = $('#bar'), titleEl = $('#title'), backEl = $('#back'), tabsEl = $('#tabs'), refreshEl = $('#refresh'), lockEl = $('#lock');
  const paintBar = () => { refreshEl.classList.toggle('is-spinning', state.syncing); document.body.classList.toggle('is-syncing', state.syncing); };

  const swap = (fn, keepScroll) => {
    const y = scrollY;
    // A fresh screen fades up; a background refresh redraws in place without moving anything
    main.classList.toggle('no-anim', !!keepScroll);
    const run = () => { fn(); scrollTo(0, keepScroll ? y : 0); };
    run();
  };

  function render({ keepScroll, quiet } = {}) {
    if (!state.pin || !state.data) return swap(pinScreen, false);
    const r = route();
    bar.hidden = false;
    const waiting = state.data.pending.length;
    tabsEl.hidden = r.view === 'booking' || r.view === 'done';
    backEl.hidden = !tabsEl.hidden;
    $('#tab-waiting').setAttribute('aria-current', String(r.view === 'waiting'));
    $('#tab-schedule').setAttribute('aria-current', String(r.view === 'schedule'));
    $('#tab-waiting-n').textContent = waiting || '';
    document.title = waiting ? `(${waiting}) Bookings` : 'Bookings';
    if (navigator.setAppBadge) { try { waiting ? navigator.setAppBadge(waiting) : navigator.clearAppBadge(); } catch { /* not supported */ } }
    const views = { waiting: waitingView, schedule: scheduleView, booking: bookingView, done: doneView };
    // A background refresh never yanks someone out of a screen they are filling in
    if (quiet && r.view === 'booking') { titleEl.textContent = 'Booking'; return paintPicker(); }
    swap(() => views[r.view](r), keepScroll);
  }

  const status = () => state.offline
    ? `<p class="offline">${I.wifi}<span>No connection. Showing bookings from ${esc(ago(state.syncedAt))}.</span></p>`
    : `<p class="updated">Updated ${esc(ago(state.syncedAt))}</p>`;

  function pinScreen() {
    bar.hidden = true;
    main.innerHTML = `<form class="card pin" id="pin-form" autocomplete="off">
        <img class="pin-logo" src="/assets/img/logo-240.png" alt="" width="120" height="67">
        <h2>Bookings</h2>
        <p class="muted">Reception only. Enter the reception PIN.</p>
        ${state.pinError ? `<p class="err" role="alert">${esc(state.pinError)}</p>` : ''}
        <input type="password" name="pin" inputmode="numeric" pattern="[0-9]*" aria-label="PIN" required autofocus>
        <button class="btn primary" type="submit"><span>Open bookings</span></button>
      </form>`;
    const f = $('#pin-form');
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = $('button', f);
      state.pin = f.pin.value.trim(); state.pinError = '';
      btn.disabled = true; btn.classList.add('is-busy'); $('span', btn).textContent = 'Opening';
      try {
        const data = await api({ api: 'sync' });
        if (!data.ok) { state.pin = ''; state.pinError = pinProblem(data.error) || 'Could not open bookings. Try again.'; return pinScreen(); }
        state.data = data; state.syncedAt = Date.now();
        store.set('rnh-pin', state.pin); store.set('rnh-feed', JSON.stringify(data)); store.set('rnh-feed-at', String(state.syncedAt));
        scheduleSync();
        render();
      } catch {
        state.pin = ''; state.pinError = 'No connection to the booking service. Check the internet and try again.';
        pinScreen();
      }
    });
  }

  function waitingView() {
    titleEl.textContent = 'Bookings';
    const list = state.data.pending;
    main.innerHTML = list.length
      ? `<div class="lead-row"><p class="lead">${list.length === 1 ? '1 booking is' : `${list.length} bookings are`} waiting</p>${status()}</div>
         ${list.map(b => `<a class="booking${state.fresh.has(b.id) ? ' is-new' : ''}" href="#b/${encodeURIComponent(b.id)}">
            <span class="avatar" style="background:${colorOf(b.doctor)}">${esc(b.name.trim().charAt(0).toUpperCase())}</span>
            <span class="b-main">
              <strong>${esc(b.name)}${state.fresh.has(b.id) ? '<em class="pill">New</em>' : ''}</strong>
              <span class="b-when${b.date === today() ? ' is-today' : ''}">${esc(dayLabel(b.date))}${b.time ? `, ${tl(b.time)}` : ''}</span>
              <span class="b-meta">${esc(b.doctor || 'No doctor chosen')}</span>
            </span>${I.next}</a>`).join('')}`
      : `${status()}<section class="card empty"><span class="ring calm">${I.tick}</span><h2>All caught up</h2><p class="muted">New WhatsApp bookings appear here by themselves.</p></section>`;
  }

  function scheduleView(r) {
    titleEl.textContent = 'Schedule';
    const first = addDays(today(), -1), last = state.data.last;
    const day = r.day && r.day >= first && r.day <= last ? r.day : today();
    const days = []; for (let d = first; d <= last; d = addDays(d, 1)) days.push(d);
    const week = state.data.schedule[day] || {};
    const waitingToday = state.data.pending.filter(b => b.date === day);
    const total = Object.values(week).reduce((n, l) => n + l.length, 0);
    main.innerHTML = `<nav class="days" aria-label="Choose a day">${days.map(d => `<a class="day${d === day ? ' is-on' : ''}${isSunday(d) ? ' is-sun' : ''}" href="#schedule/${d}" data-replace${d === day ? ' aria-current="date"' : ''}>
        <span>${d === today() ? 'Today' : fmt(d, { weekday: 'short' })}</span><strong>${fmt(d, { day: 'numeric' })}</strong></a>`).join('')}</nav>
      <div class="lead-row"><p class="lead"><strong>${esc(dayLabel(day))}</strong> · ${total ? `${total} appointment${total === 1 ? '' : 's'}` : isSunday(day) ? 'OPD closed' : 'no appointments yet'}${waitingToday.length ? `, ${waitingToday.length} waiting` : ''}</p>${status()}</div>
      ${state.data.doctors.map(doc => {
        const list = week[doc.name] || [], wait = waitingToday.filter(b => b.doctor === doc.name);
        return `<section class="card doc">
          <h2 class="doc-head"><span class="dot" style="background:${doc.color}"></span><span>${esc(doc.name)}</span><span class="doc-n">${list.length || ''}</span></h2>
          ${list.length || wait.length ? `<ul class="slots">
            ${[...list.map(e => ({ ...e, kind: 'ok' })), ...wait.map(b => ({ t: b.time, name: b.name, dept: 'Waiting for approval', id: b.id, kind: 'wait' }))].sort((a, b) => a.t < b.t ? -1 : 1).map(e => `<li${e.kind === 'wait' ? ' class="is-wait"' : ''}>
              ${e.kind === 'wait' ? `<a href="#b/${encodeURIComponent(e.id)}">` : e.phone ? `<a href="tel:${esc(e.phone)}">` : '<div>'}
              <span class="slot-t" style="color:${doc.color}">${tl(e.t)}</span>
              <span class="slot-p"><strong>${esc(e.name)}</strong>${e.dept ? `<span>${esc(e.dept)}</span>` : ''}</span>
              ${e.kind === 'wait' ? I.next + '</a>' : e.phone ? I.phone + '</a>' : '</div>'}</li>`).join('')}</ul>`
            : '<p class="muted">No appointments</p>'}
        </section>`;
      }).join('')}`;
    $('.day.is-on', main)?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  /* ---------- One booking: check it, choose doctor, day and time, approve ---------- */
  function bookingView(r) {
    titleEl.textContent = 'Booking';
    const b = state.data.pending.find(x => x.id === r.id);
    if (!b) {
      main.innerHTML = `<section class="card result"><span class="ring">${I.tick}</span><h2>Already handled</h2><p>This booking is no longer waiting.</p></section><a class="btn line" href="#">All bookings</a>`;
      return;
    }
    if (state.pick.id !== b.id) {
      const first = today(), dayOK = b.date && b.date >= first && b.date <= state.data.last;
      state.pick = { id: b.id, doctor: b.doctor, date: dayOK ? b.date : first, t: dayOK ? b.time : '' };
    }
    main.innerHTML = `<section class="card who">
        <h2 class="pname">${esc(b.name)}</h2>
        <p class="when">Asked for ${esc(dayLabel(b.date))}${b.time ? `, ${tl(b.time)}` : ''}</p>
        <div class="pair">
          <a class="btn line" href="tel:${esc(b.phone)}">${I.phone}Call</a>
          <a class="btn line" href="${waUrl(b.phone)}" target="_blank" rel="noopener">${I.wa}WhatsApp</a>
        </div>
        <dl class="rows">
          <div><dt>Phone</dt><dd>${esc(b.phone)}</dd></div>
          <div><dt>Department</dt><dd>${esc(b.department)}</dd></div>
          ${b.message ? `<div class="wide"><dt>Note</dt><dd>${esc(b.message)}</dd></div>` : ''}
          <div class="wide"><dt>Request</dt><dd>${esc(b.id)}</dd></div>
        </dl>
      </section>
      <section class="card confirm">
        <h3>Confirm the appointment</h3>
        <div class="group"><p class="g-label">Doctor</p><div class="chips docs" id="pick-doctor"></div></div>
        <div class="group"><p class="g-label">Day</p><div class="chips days-pick" id="pick-day"></div></div>
        <div class="group"><p class="g-label">Time</p><div id="pick-time"></div></div>
      </section>
      <details class="card decline">
        <summary>Decline this booking</summary>
        <form id="decline-form">
          <label>Reason (optional, goes in the message to the patient)<input type="text" name="reason" maxlength="300" placeholder="Doctor is on leave that day"></label>
          <button class="btn line danger" type="submit">Decline</button>
        </form>
      </details>
      <div class="dock"><button class="btn primary" id="approve" type="button"></button></div>`;
    paintPicker();
    $('#approve').addEventListener('click', () => decide(b, 'approve'));
    $('#decline-form').addEventListener('submit', e => { e.preventDefault(); decide(b, 'decline', e.target.reason.value.trim()); });
  }
  // Time taken by others: the open booking's own hold does not count against itself
  const takenFor = (b, date, doctor, t) => {
    let n = (((state.data.taken[date] || {})[doctor] || {})[t]) || 0;
    if (b && b.doctor === doctor && b.date === date && b.time === t) n -= 1;
    return n >= (state.data.perSlot || 1);
  };
  function paintPicker() {
    const box = $('#pick-time');
    if (!box) return;
    const p = state.pick, b = state.data.pending.find(x => x.id === p.id);
    const days = []; for (let d = today(); d <= state.data.last; d = addDays(d, 1)) if (!isSunday(d)) days.push(d);
    $('#pick-doctor').innerHTML = state.data.doctors.map(d => `<button type="button" class="chip doc-chip" data-doctor="${esc(d.name)}" aria-pressed="${d.name === p.doctor}"><span class="dot" style="background:${d.color}"></span>${esc(d.name.replace(/^Dr\. /, 'Dr. '))}</button>`).join('');
    $('#pick-day').innerHTML = days.map(d => `<button type="button" class="chip day-chip" data-date="${d}" aria-pressed="${d === p.date}"><span>${d === today() ? 'Today' : fmt(d, { weekday: 'short' })}</span><strong>${fmt(d, { day: 'numeric', month: 'short' })}</strong></button>`).join('');
    const isToday = p.date === today(), now = nowHHMM();
    box.innerHTML = state.data.sessions.map(sess => `<p class="sess">${esc(sess[0])}</p><div class="chips times">${slotsOf(sess).map(t => {
      const booked = p.doctor && takenFor(b, p.date, p.doctor, t), past = isToday && t <= now;
      if ((booked || past) && p.t === t) p.t = '';
      return `<button type="button" class="chip time-chip${booked ? ' is-booked' : ''}" data-t="${t}" aria-pressed="${t === p.t}"${booked || past ? ' disabled' : ''}>${tl(t)}${booked ? '<small>booked</small>' : ''}</button>`;
    }).join('')}</div>`).join('');
    const btn = $('#approve');
    if (btn) {
      const ready = p.doctor && p.date && p.t;
      btn.disabled = !ready;
      btn.innerHTML = ready ? `${I.tick}<span>Approve ${esc(dayLabel(p.date))}, ${tl(p.t)}</span>` : `<span>${!p.doctor ? 'Choose a doctor' : !p.t ? 'Choose a time' : 'Choose a day'}</span>`;
    }
  }
  function onPick(e) {
    const c = e.target.closest('.chip');
    if (!c || c.disabled || !c.closest('.confirm')) return;
    if (c.dataset.doctor) state.pick.doctor = c.dataset.doctor;
    if (c.dataset.date) state.pick.date = c.dataset.date;
    if (c.dataset.t) state.pick.t = c.dataset.t;
    paintPicker();
  }

  /* ---------- Deciding: the result shows at once; the WhatsApp button waits until it is saved ---------- */
  async function decide(b, kind, reason = '') {
    const p = state.pick;
    const d = { kind, b, date: p.date, t: p.t, doctor: p.doctor, reason };
    state.deciding.set(b.id, d);
    state.results.set(b.id, { ...d, saving: true });
    state.data.pending = state.data.pending.filter(x => x.id !== b.id);
    if (kind === 'approve') addToWeek(state.data, d);
    state.fresh.delete(b.id);
    go(`done/${encodeURIComponent(b.id)}`, true);
    try {
      const res = await api(kind === 'approve' ? { api: 'approve', id: b.id, cdate: d.date, ctime: d.t, doctor: d.doctor } : { api: 'decline', id: b.id, reason });
      if (!res.ok) {
        const msg = pinProblem(res.error);
        if (msg) { state.deciding.delete(b.id); return lock(msg); }
        throw Object.assign(new Error(res.error), { code: res.error, status: res.status });
      }
      state.results.set(b.id, { ...d, saving: false, note: res.eventNote || '' });
    } catch (err) {
      state.results.set(b.id, { ...d, saving: false, error: err.code || 'network', status: err.status });
    } finally {
      state.deciding.delete(b.id);
    }
    if (route().view === 'done') render({ keepScroll: true });
    sync({ quiet: true });
  }

  function doneView(r) {
    const x = state.results.get(r.id);
    if (!x) return go('', true);
    const { b } = x;
    titleEl.textContent = x.kind === 'approve' ? 'Approved' : 'Declined';
    if (x.error) {
      titleEl.textContent = 'Not saved';
      const why = x.error === 'taken' ? `${x.doctor} already has a patient at ${tl(x.t)} on ${dayLabel(x.date)}. Choose another time.`
        : x.error === 'decided' ? `This booking was already ${String(x.status || 'handled').toLowerCase()} on another phone.`
        : x.error === 'network' ? 'There was no connection, so nothing was saved. Check the internet and try again.'
        : 'The booking service could not save this. Try again.';
      main.innerHTML = `<section class="card result"><span class="ring cross">${I.cross}</span><h2>Not saved</h2><p>${esc(why)}</p></section>
        ${x.error === 'decided' ? '' : `<a class="btn primary" href="#b/${encodeURIComponent(b.id)}" data-replace>${I.back}Back to ${esc(b.name)}</a>`}
        <a class="btn line" href="#">All bookings</a>`;
      if (x.error !== 'decided' && !state.data.pending.some(p => p.id === b.id)) state.data.pending.unshift(b);
      return;
    }
    const approved = x.kind === 'approve';
    const msg = approved ? confirmText(b, x.date, x.t, x.doctor) : declineText(b, x.reason);
    main.innerHTML = `<section class="card result">
        <span class="ring ${approved ? 'tick' : 'cross'}">${approved ? I.tick : I.cross}</span>
        <h2>${approved ? 'Approved' : 'Declined'}</h2>
        <p><strong>${esc(b.name)}</strong>${approved ? `<br>${esc(dayLabel(x.date))}, ${tl(x.t)}<br>${esc(x.doctor)}` : ''}</p>
      </section>
      <p class="note">${x.saving ? '<span class="spinner"></span>Saving to the sheet and the calendar' : esc(x.note || 'Saved.')}</p>
      ${x.saving
        ? `<button class="btn wa" type="button" disabled>${I.wa}${approved ? 'Send confirmation on WhatsApp' : 'Tell the patient on WhatsApp'}</button>`
        : `<a class="btn wa" href="${waUrl(b.phone, msg)}" target="_blank" rel="noopener">${I.wa}${approved ? 'Send confirmation on WhatsApp' : 'Tell the patient on WhatsApp'}</a>`}
      <a class="btn line" href="#">All bookings</a>`;
  }

  /* ---------- Taps ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const h = a.getAttribute('href').slice(1);
    go(h, a.hasAttribute('data-replace') || (route().view === 'done' && !h.startsWith('b/')));
  });
  backEl.addEventListener('click', () => { if (history.state !== 'root') history.back(); else go('', true); });
  main.addEventListener('click', onPick);
  refreshEl.addEventListener('click', () => sync());
  lockEl.addEventListener('click', () => { if (confirm('Lock the app? The PIN will be needed to open it again.')) lock(''); });

  /* ---------- Start: show what was loaded last time at once, then bring it up to date ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  history.replaceState('root', '', location.href);
  render();
  if (state.pin) { sync({ quiet: true }); scheduleSync(); }
  setInterval(() => { const u = $('.updated'); if (u && !state.offline) u.textContent = `Updated ${ago(state.syncedAt)}`; }, 20000);
})();

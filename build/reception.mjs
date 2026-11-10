// The reception app's page (/reception/). Not linked from the website and kept out of search engines;
// the bookings themselves only load with the reception PIN.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BOOKING, SITE } from './data.mjs';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'reception');
const v = file => createHash('sha1').update(readFileSync(join(dir, file))).digest('hex').slice(0, 10);

export const receptionPage = () => `<!doctype html>
<html lang="en-IN" data-endpoint="${BOOKING.endpoint}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#0B2A6F">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Bookings">
<title>Bookings</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/logo-240.png">
<link rel="preconnect" href="https://script.google.com">
<link rel="preconnect" href="https://script.googleusercontent.com">
<link rel="stylesheet" href="app.css?v=${v('app.css')}">
</head>
<body>
<header class="bar" id="bar" hidden>
  <div class="bar-in">
    <button class="icon-btn" id="back" type="button" aria-label="Back" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6"/></svg></button>
    <div><span class="org">${SITE.name}</span><h1 id="title">Bookings</h1></div>
    <div class="bar-tools">
      <button class="icon-btn" id="refresh" type="button" aria-label="Refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></svg></button>
      <button class="icon-btn" id="lock" type="button" aria-label="Lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg></button>
    </div>
  </div>
  <nav class="tabs" id="tabs"><div class="tabs-in">
    <a id="tab-waiting" href="#" data-replace aria-current="true">Waiting<span id="tab-waiting-n"></span></a>
    <a id="tab-schedule" href="#schedule" data-replace aria-current="false">Schedule</a>
  </div></nav>
</header>
<main id="main" aria-live="polite"></main>
<script src="app.js?v=${v('app.js')}" defer></script>
</body>
</html>
`;

// Renders index.html and services/<slug>/index.html. Run: npm run build
// On Vercel (or with PUBLISH=1) it also copies just the live site into public/, which Vercel serves.
import { mkdir, writeFile, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SERVICES } from './data.mjs';
import { CONTENT } from './services-content.mjs';
import { landing } from './landing.mjs';
import { servicePage } from './service-template.mjs';

const out = join(dirname(fileURLToPath(import.meta.url)), '..');

// Clear old pages first so a renamed or removed department never lingers
await rm(join(out, 'services'), { recursive: true, force: true });
await writeFile(join(out, 'index.html'), landing());
for (const svc of SERVICES) {
  const dir = join(out, 'services', svc.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), servicePage(svc, CONTENT[svc.slug]));
}
console.log(`Built index.html and ${SERVICES.length} service pages.`);

// Publish only what visitors need; notes, build scripts and the booking script stay out of the live site
if (process.env.VERCEL || process.env.PUBLISH) {
  const pub = join(out, 'public');
  await rm(pub, { recursive: true, force: true });
  for (const item of ['index.html', 'services', 'assets']) await cp(join(out, item), join(pub, item), { recursive: true });
  console.log('Copied the site into public/ for publishing.');
}

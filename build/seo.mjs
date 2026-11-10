// Structured data (schema.org JSON-LD) that tells search engines what the hospital is, where it is and what it offers.
import { SITE, PRIMARY, SERVICES, DOCTORS, EMERGENCY, BOOKING } from './data.mjs';

const abs = (path = '') => `${SITE.url}/${path}`;
const hhmm = t => t.length === 4 ? `0${t}` : t;

export const hospitalLd = () => ({
  '@context': 'https://schema.org',
  '@type': ['Hospital', 'MedicalClinic'],
  '@id': abs('#hospital'),
  name: SITE.name,
  url: abs(),
  logo: abs('assets/img/logo.png'),
  image: abs('assets/img/logo.png'),
  description: `${SITE.name} in ${PRIMARY.addressLines[1]}, ${SITE.town}: ${SERVICES.map(s => s.name.toLowerCase()).join(', ')}, with emergency care 24 hours a day.`,
  telephone: PRIMARY.tel,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${PRIMARY.addressLines[0]}, ${PRIMARY.addressLines[1]}`,
    addressLocality: SITE.town,
    addressRegion: SITE.state,
    postalCode: PRIMARY.addressLines[2].match(/\d{6}/)?.[0],
    addressCountry: 'IN'
  },
  geo: { '@type': 'GeoCoordinates', latitude: PRIMARY.geo[0], longitude: PRIMARY.geo[1] },
  hasMap: PRIMARY.mapUrl,
  areaServed: [SITE.town, 'West Godavari'],
  openingHoursSpecification: BOOKING.sessions.map(([, opens, closes]) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: hhmm(opens), closes: hhmm(closes)
  })),
  ...(EMERGENCY.available24h ? { availableService: { '@type': 'MedicalProcedure', name: 'Emergency care, 24 hours, every day' } } : {}),
  medicalSpecialty: ['Obstetric', 'Gynecologic', 'Emergency', 'PrimaryCare'],
  department: SERVICES.map(s => ({ '@type': 'MedicalClinic', name: `${s.name}, ${SITE.name}`, url: abs(`services/${s.slug}/`), description: s.summary })),
  employee: DOCTORS.map(d => ({ '@type': 'Person', name: d.name, jobTitle: `${d.specialty} doctor`, hasCredential: d.qualification }))
});

// FAQ answers go in as plain text; questions still waiting on the hospital are left out
export const faqLd = items => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.filter(([, a]) => !a.includes('class="tbc')).map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() }
  }))
});

export const breadcrumbLd = crumbs => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) }))
});

export const sitemap = pages => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([path, priority]) => `  <url><loc>${abs(path)}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><priority>${priority}</priority></url>`).join('\n')}
</urlset>
`;

export const robots = () => `User-agent: *
Allow: /

Sitemap: ${abs('sitemap.xml')}
`;

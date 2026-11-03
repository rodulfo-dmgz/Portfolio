import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const racine = import.meta.dirname;

/** Chemin public des pages indexables. Les études de cas ajoutent le leur côté navigateur (projet.js) et dans le plan du site. */
const CHEMINS = {
  accueil: '/',
  'a-propos': '/a-propos',
  expertises: '/expertises',
  realisations: '/realisations',
  contact: '/contact',
};

const lireJson = (nom) => JSON.parse(readFileSync(resolve(racine, 'src/data', `${nom}.json`), 'utf8'));

/**
 * Adresse publique du site : variable SITE_URL, sinon domaine de production fourni par Vercel au moment du build.
 * Sans adresse, les balises absolues (canonical, Open Graph, plan du site) sont omises.
 */
function adresseDuSite() {
  const brute = process.env.SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  return brute.replace(/\/+$/, '');
}

function donneesStructurees(site) {
  const profil = lireJson('profile');
  const personne = {
    '@type': 'Person',
    name: profil.nom,
    jobTitle: profil.titre,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profil.ville,
      addressRegion: profil.region,
      addressCountry: 'FR',
    },
    sameAs: [profil.contact.linkedin, profil.contact.github],
    knowsAbout: profil.domaines,
    ...(site && { url: `${site}/` }),
  };
  const siteWeb = {
    '@type': 'WebSite',
    name: profil.nom,
    inLanguage: 'fr-FR',
    ...(site && { url: `${site}/` }),
  };
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [siteWeb, personne] })}</script>`;
}

function balisesAbsolues(site, chemin) {
  const profil = lireJson('profile');
  const image = `${site}/assets/images/og-image.png`;
  return [
    `<link rel="canonical" href="${site}${chemin}" />`,
    `<meta property="og:url" content="${site}${chemin}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${profil.nom}, ${profil.titre.toLowerCase()} à ${profil.ville}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ');
}

/** Balises de référencement ajoutées à chaque page au moment du build, et plan du site + robots.txt. */
export function seo() {
  const site = adresseDuSite();

  return {
    name: 'seo',

    transformIndexHtml: {
      order: 'post',
      handler(html, { filename }) {
        const nom = basename(filename, '.html');
        const page = nom === 'index' ? 'accueil' : nom;
        const ajouts = [];
        if (page === 'accueil') ajouts.push(donneesStructurees(site));
        if (site && CHEMINS[page]) ajouts.push(balisesAbsolues(site, CHEMINS[page]));
        return ajouts.length ? html.replace('</head>', `    ${ajouts.join('\n    ')}\n  </head>`) : html;
      },
    },

    generateBundle() {
      let robots = 'User-agent: *\nAllow: /\n';

      if (site) {
        const chemins = [
          ...Object.values(CHEMINS),
          ...lireJson('projects').projets.map((projet) => `/realisations/${projet.slug}`),
        ];
        const urls = chemins.map((chemin) => `  <url><loc>${site}${chemin}</loc></url>`).join('\n');
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        });
        robots += `\nSitemap: ${site}/sitemap.xml\n`;
      } else {
        this.warn('Aucune adresse de site (SITE_URL ou domaine Vercel) : sitemap.xml, canonical et Open Graph absolus omis.');
      }

      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}

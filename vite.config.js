import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { seo } from './vite.seo.js';

const racine = import.meta.dirname;

/** Pages HTML du site. La clé est le nom de la page dans la navigation. */
const pages = {
  accueil: 'index.html',
  'a-propos': 'a-propos.html',
  expertises: 'expertises.html',
  realisations: 'realisations.html',
  projet: 'projet.html',
  contact: 'contact.html',
  'mentions-legales': 'mentions-legales.html',
  404: '404.html',
};

/** Page de navigation mise en avant pour chaque page. Une étude de cas relève de « Réalisations ». */
const rubrique = { projet: 'realisations' };

/**
 * Les URL propres du site, les mêmes que celles de vercel.json.
 * `/realisations/:slug` affiche le modèle d'étude de cas.
 */
function reecrireUrl(url) {
  const [chemin, requete = ''] = url.split('?');
  const suffixe = requete ? `?${requete}` : '';
  if (chemin === '/') return null;
  if (/^\/realisations\/[^/.]+\/?$/.test(chemin)) return `/projet.html${suffixe}`;
  const nom = chemin.replace(/^\/|\/$/g, '');
  if (nom in pages && nom !== 'accueil' && nom !== 'projet') return `/${nom}.html${suffixe}`;
  return null;
}

/** Icônes Iconoir utilisées par le site, insérées en SVG dans le HTML (`<!--@icon nom-->`). */
function icone(nom) {
  const svg = readFileSync(resolve(racine, 'node_modules/iconoir/icons/regular', `${nom}.svg`), 'utf8');
  return svg.replace(/<svg [^>]*>/, '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke-width="1.5" aria-hidden="true" focusable="false">');
}

/** Valeur d'un chemin du profil (`{{profil.contact.email}}`), lue dans src/data/profile.json. */
function valeurProfil(chemin) {
  const profil = JSON.parse(readFileSync(resolve(racine, 'src/data/profile.json'), 'utf8'));
  const valeur = chemin.split('.').reduce((courant, cle) => courant?.[cle], profil);
  if (typeof valeur !== 'string') throw new Error(`Valeur de profil introuvable : ${chemin}`);
  return valeur;
}

/** Insère les composants partagés (`<!--@include nom-->`), les icônes, les valeurs du profil et marque la page active dans la navigation. */
function composantsHtml() {
  return {
    name: 'composants-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html, { filename }) {
        const page = basename(filename, '.html') === 'index' ? 'accueil' : basename(filename, '.html');
        const active = rubrique[page] ?? page;
        return html
          .replace(/<!--@include ([\w-]+)-->/g, (_, nom) =>
            readFileSync(resolve(racine, 'src/components', `${nom}.html`), 'utf8'))
          .replace(/<!--@icon ([\w-]+)-->/g, (_, nom) => icone(nom))
          .replace(/\{\{profil\.([\w.]+)\}\}/g, (_, chemin) => valeurProfil(chemin))
          .replace(/data-nav="([\w-]+)"/g, (repere, nom) =>
            nom === active ? `${repere} aria-current="page"` : repere);
      },
    },
  };
}

/** Sert les URL propres avec `vite` et `vite preview`. */
function urlsPropres() {
  const intercepter = (serveur) => {
    serveur.middlewares.use((req, _res, suite) => {
      const cible = reecrireUrl(req.url ?? '');
      if (cible) req.url = cible;
      suite();
    });
  };
  return {
    name: 'urls-propres',
    configureServer: intercepter,
    configurePreviewServer: intercepter,
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [composantsHtml(), seo(), urlsPropres()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([nom, fichier]) => [nom, resolve(racine, fichier)]),
      ),
    },
  },
});

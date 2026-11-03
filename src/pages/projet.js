import flecheDroite from 'iconoir/icons/regular/arrow-right.svg?raw';
import flecheGauche from 'iconoir/icons/regular/arrow-left.svg?raw';
import flecheHautDroite from 'iconoir/icons/regular/arrow-up-right.svg?raw';
import telecharger from 'iconoir/icons/regular/download.svg?raw';
import { getCategories, getProjectBySlug, getProjects } from '../services/contentRepository.js';
import { activerVisionneuse } from '../components/lightbox.js';
import { echapperHtml, icone } from '../scripts/utils.js';

const e = echapperHtml;
const icones = {
  droite: icone(flecheDroite),
  gauche: icone(flecheGauche),
  externe: icone(flecheHautDroite),
  telecharger: icone(telecharger),
};

const conteneur = document.querySelector('[data-rendu="etude"]');
const filCourant = document.querySelector('[data-fil-courant]');
const slug = location.pathname.split('/').filter(Boolean).at(-1);

const paragraphe = (texte) => (texte ? `<p>${e(texte)}</p>` : '');
const liste = (elements, balise = 'ul') =>
  elements?.length ? `<${balise}>${elements.map((element) => `<li>${e(element)}</li>`).join('')}</${balise}>` : '';

/** Section de texte de l'étude de cas ; omise quand elle n'a pas de contenu. */
function section(titre, contenu) {
  if (!contenu) return '';
  return `<section class="etude__section"><h2>${e(titre)}</h2>${contenu}</section>`;
}

function rendreRessource(ressource) {
  const lien = e(ressource.url);
  const titre = e(ressource.titre);
  if (ressource.type === 'video' && /\.(mp4|webm)$/i.test(ressource.url)) {
    return `<li class="ressource ressource--video"><video controls preload="none" src="${lien}" aria-label="${titre}"></video><p>${titre}</p></li>`;
  }
  const libelles = { pdf: 'Document PDF', demo: 'Démonstration interactive', video: 'Vidéo', lien: 'Lien externe' };
  const telechargement = ressource.type === 'pdf';
  return `<li class="ressource"><a class="lien-fleche" href="${lien}" target="_blank" rel="noopener noreferrer"${telechargement ? ' download' : ''}>${titre}<span class="visually-hidden"> (${libelles[ressource.type] ?? libelles.lien}, nouvel onglet)</span>${telechargement ? icones.telecharger : icones.externe}</a></li>`;
}

function rendreGalerie(images) {
  if (!images?.length) return '';
  const figures = images
    .map((image) => `<figure class="galerie-etude__image"><button class="galerie-etude__agrandir" type="button" data-agrandir="${e(image.grande ?? image.src)}" aria-label="Agrandir l’image : ${e(image.alt)}"><img src="${e(image.src)}" alt="${e(image.alt)}" loading="lazy" decoding="async" /></button>${image.legende ? `<figcaption>${e(image.legende)}</figcaption>` : ''}</figure>`)
    .join('');
  return section('Galerie', `<div class="galerie-etude">${figures}</div>`);
}

function rendreVoisin(projet, sens) {
  const gauche = sens === 'precedent';
  return `
    <a class="voisin voisin--${sens}" href="/realisations/${e(projet.slug)}">
      <span class="voisin__sens">${gauche ? icones.gauche : ''}${gauche ? 'Projet précédent' : 'Projet suivant'}${gauche ? '' : icones.droite}</span>
      <span class="voisin__titre">${e(projet.title)}</span>
    </a>`;
}

function mettreAJourMeta(titre, description) {
  document.title = `${titre} — Rodulfo Dominguez`;
  const reglages = {
    'meta[name="description"]': description,
    'meta[property="og:title"]': `${titre} — Rodulfo Dominguez`,
    'meta[property="og:description"]': description,
  };
  for (const [selecteur, valeur] of Object.entries(reglages)) document.querySelector(selecteur)?.setAttribute('content', valeur);
}

function marquerNonIndexable() {
  const meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex';
  document.head.append(meta);
}

function declarerAdresseCanonique() {
  const lien = document.createElement('link');
  lien.rel = 'canonical';
  lien.href = `${location.origin}${location.pathname}`;
  document.head.append(lien);
}

function rendreIntrouvable() {
  marquerNonIndexable();
  document.title = 'Réalisation introuvable — Rodulfo Dominguez';
  filCourant.textContent = 'Réalisation introuvable';
  conteneur.innerHTML = `
    <header class="page-tete container">
      <h1 class="page-tete__titre">Réalisation introuvable</h1>
      <p class="page-tete__intro">Cette réalisation n’existe pas ou a été déplacée.</p>
      <div class="hero__actions"><a class="btn btn--cta" href="/realisations">Voir toutes les réalisations</a></div>
    </header>`;
}

try {
  const resultat = await getProjectBySlug(slug);
  if (!resultat) {
    rendreIntrouvable();
  } else {
    const { projet, precedent, suivant } = resultat;
    const [categories, tous] = await Promise.all([getCategories(), getProjects()]);
    const categorie = categories.find((c) => c.id === projet.category)?.label ?? '';
    const ton = (tous.findIndex((p) => p.slug === projet.slug) % 3) + 1;
    const c = projet.content;

    mettreAJourMeta(projet.title, c.presentation || projet.description);
    declarerAdresseCanonique();
    filCourant.textContent = projet.title;

    const visuel = projet.cover
      ? `<img class="projet__image" src="${e(projet.cover)}" alt="${e(projet.coverAlt)}" decoding="async" />`
      : `<span class="projet__numero" aria-hidden="true">${String(tous.findIndex((p) => p.slug === projet.slug) + 1).padStart(2, '0')}</span>`;

    const fiche = `
      <dl class="fiche">
        <div><dt>Catégorie</dt><dd>${e(categorie)}</dd></div>
        ${projet.year ? `<div><dt>Année</dt><dd>${e(projet.year)}</dd></div>` : ''}
        ${c.audience ? `<div><dt>Public cible</dt><dd>${e(c.audience)}</dd></div>` : ''}
        ${c.tools?.length ? `<div><dt>Outils</dt><dd><ul class="etiquettes" role="list">${c.tools.map((outil) => `<li>${e(outil)}</li>`).join('')}</ul></dd></div>` : ''}
        ${c.deliverables?.length ? `<div><dt>Livrables</dt><dd>${liste(c.deliverables)}</dd></div>` : ''}
      </dl>`;

    const demonstration = c.resources?.find((ressource) => ressource.type === 'demo');
    const autres = (c.resources ?? []).filter((ressource) => ressource !== demonstration);
    const ressources = autres.length ? section('Ressources', `<ul class="ressources" role="list">${autres.map(rendreRessource).join('')}</ul>`) : '';
    const bouton = demonstration
      ? `<div class="hero__actions"><a class="btn btn--cta" href="${e(demonstration.url)}" target="_blank" rel="noopener noreferrer">${e(demonstration.titre)}<span class="visually-hidden"> (nouvel onglet)</span>${icones.externe}</a></div>`
      : '';
    const avis = projet.demo ? 'Contenu de démonstration' : projet.etudeComplete === false ? 'Étude de cas détaillée à venir' : '';
    const voisins = tous.length > 1 ? `<div class="voisins">${rendreVoisin(precedent, 'precedent')}${rendreVoisin(suivant, 'suivant')}</div>` : '';

    conteneur.innerHTML = `
      <header class="page-tete container">
        <p class="eyebrow">${[categorie, projet.year].filter(Boolean).map(e).join(' · ')}</p>
        <h1 class="page-tete__titre">${e(projet.title)}</h1>
        ${c.presentation ? `<p class="page-tete__intro">${e(c.presentation)}</p>` : ''}
        ${avis ? `<p class="etude__demo">${avis}</p>` : ''}
        ${bouton}
      </header>
      <div class="container">
        <div class="projet etude__visuel" data-ton="${ton}"><div class="projet__visuel">${visuel}</div></div>
      </div>
      <div class="container etude__corps">
        <aside class="etude__fiche" aria-label="Fiche du projet">${fiche}</aside>
        <div class="etude__texte">
          ${section('Contexte', paragraphe(c.context))}
          ${section('Problématique', paragraphe(c.problem))}
          ${section('Objectifs', liste(c.objectives))}
          ${section('Démarche et conception', liste(c.approach, 'ol'))}
          ${section('Résultats', paragraphe(c.results))}
          ${rendreGalerie(c.gallery)}
          ${ressources}
        </div>
      </div>
      <nav class="container etude__suite" aria-label="Autres réalisations">
        ${voisins}
        <a class="lien-fleche" href="/realisations">${icones.gauche}Retour à toutes les réalisations</a>
      </nav>`;
    activerVisionneuse(conteneur);
  }
} catch {
  conteneur.innerHTML = '<header class="page-tete container"><h1 class="page-tete__titre">Étude de cas</h1><p class="page-tete__intro">Impossible de charger cette réalisation. Actualisez la page.</p></header>';
}

conteneur.dataset.pret = '';

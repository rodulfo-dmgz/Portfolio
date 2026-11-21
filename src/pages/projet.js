import flecheDroite from 'iconoir/icons/regular/arrow-right.svg?raw';
import flecheGauche from 'iconoir/icons/regular/arrow-left.svg?raw';
import flecheHautDroite from 'iconoir/icons/regular/arrow-up-right.svg?raw';
import telecharger from 'iconoir/icons/regular/download.svg?raw';
import { getCategories, getProjectBySlug, getProjects, getTypes } from '../services/contentRepository.js';
import { activerVisionneuse } from '../components/lightbox.js';
import { activerCarrousel, rendreApercus } from '../components/carrousel.js';
import { echapperHtml, icone } from '../scripts/utils.js';
import { ECRAN } from '../scripts/ecran.js';

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
  return `<section class="rubrique"><h2 class="rubrique__titre">${e(titre)}</h2><div class="rubrique__texte">${contenu}</div></section>`;
}

/** Rubriques : des onglets sur grand écran (une seule visible à la fois), toutes à la suite sinon. */
function rendreRubriques(elements) {
  const presentes = elements.filter(([, contenu]) => contenu);
  if (!ECRAN.matches || presentes.length < 2) return `<div class="rubriques">${presentes.map(([titre, contenu]) => section(titre, contenu)).join('')}</div>`;
  return `
    <div class="rubriques rubriques--onglets">
      <div class="onglets" role="tablist" aria-label="Détails du projet">
        ${presentes.map(([titre], i) => `<button class="onglet-projet" type="button" role="tab" id="onglet-${i}" aria-selected="${i === 0}" aria-controls="panneau-${i}" tabindex="${i === 0 ? 0 : -1}">${e(titre)}</button>`).join('')}
      </div>
      <div class="panneaux">
        ${presentes.map(([titre, contenu], i) => `<div class="panneau-projet" role="tabpanel" id="panneau-${i}" aria-labelledby="onglet-${i}" tabindex="0"${i ? ' data-inactif' : ''}><div class="rubrique__texte">${contenu}</div></div>`).join('')}
      </div>
    </div>`;
}

function activerOnglets(racine) {
  const liste = racine.querySelector('.onglets');
  if (!liste) return;
  const onglets = [...liste.querySelectorAll('[role="tab"]')];
  const panneaux = [...racine.querySelectorAll('.panneau-projet')];
  const choisir = (rang, focus = false) => {
    onglets.forEach((onglet, i) => {
      onglet.setAttribute('aria-selected', String(i === rang));
      onglet.tabIndex = i === rang ? 0 : -1;
      panneaux[i].toggleAttribute('data-inactif', i !== rang);
    });
    if (focus) onglets[rang].focus();
  };
  liste.addEventListener('click', (evenement) => {
    const onglet = evenement.target.closest('[role="tab"]');
    if (onglet) choisir(onglets.indexOf(onglet));
  });
  liste.addEventListener('keydown', (evenement) => {
    const actuel = onglets.indexOf(document.activeElement);
    const cible = { ArrowRight: actuel + 1, ArrowLeft: actuel - 1, Home: 0, End: onglets.length - 1 }[evenement.key];
    if (cible === undefined || actuel < 0) return;
    evenement.preventDefault();
    choisir((cible + onglets.length) % onglets.length, true);
  });
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

/** Mode « un seul écran » : actif seulement si la page tient sans défiler ; sinon elle se lit en défilant, comme une page normale. */
function ajusterEcran() {
  document.body.classList.remove('ecran-unique');
  if (!ECRAN.matches) return;
  document.body.classList.add('ecran-unique');
  const trop = (element) => element && element.scrollHeight > element.clientHeight + 1;
  const principal = document.querySelector('main');
  const blocs = [principal, ...conteneur.children, conteneur.querySelector('.projet-hero__texte')?.parentElement];
  if (blocs.some(trop) || conteneur.querySelector('.projet-hero__texte').getBoundingClientRect().bottom > conteneur.querySelector('.projet-hero').getBoundingClientRect().bottom + 1) {
    document.body.classList.remove('ecran-unique');
  }
}

try {
  const resultat = await getProjectBySlug(slug);
  if (!resultat) {
    rendreIntrouvable();
  } else {
    const { projet, precedent, suivant } = resultat;
    const [categories, tous, types] = await Promise.all([getCategories(), getProjects(), getTypes()]);
    const categorie = categories.find((c) => c.id === projet.category)?.label ?? '';
    const type = types.find((t) => t.id === projet.type);
    const c = projet.content;

    mettreAJourMeta(projet.title, c.presentation || projet.description);
    declarerAdresseCanonique();
    filCourant.textContent = projet.title;

    // Aperçus : l'image principale puis la galerie, dans un seul carrousel.
    const images = [projet.cover && { src: projet.cover, alt: projet.coverAlt }, ...(c.gallery ?? [])].filter(Boolean);

    const aDuTexte = Boolean(c.context || c.problem || c.results || c.objectives?.length || c.approach?.length);

    // Repères du projet : une ligne discrète sous l'image, sans colonne ni filets.
    const meta = `
      <dl class="meta">
        ${c.audience ? `<div><dt>Public</dt><dd>${e(c.audience)}</dd></div>` : ''}
        ${c.tools?.length ? `<div><dt>Outils</dt><dd><ul class="etiquettes" role="list">${c.tools.map((outil) => `<li>${e(outil)}</li>`).join('')}</ul></dd></div>` : ''}
      </dl>`;

    const demonstration = c.resources?.find((ressource) => ressource.type === 'demo');
    const autres = (c.resources ?? []).filter((ressource) => ressource !== demonstration);
    const ressources = autres.length ? `<ul class="ressources" role="list">${autres.map(rendreRessource).join('')}</ul>` : '';
    const bouton = demonstration
      ? `<div class="hero__actions"><a class="btn btn--cta" href="${e(demonstration.url)}" target="_blank" rel="noopener noreferrer">${e(demonstration.titre)}<span class="visually-hidden"> (nouvel onglet)</span>${icones.externe}</a></div>`
      : '';
    const avis = projet.demo ? 'Contenu de démonstration' : '';
    const aVenir = !aDuTexte && projet.etudeComplete === false ? '<p class="etude__avenir">L’étude de cas détaillée (contexte, objectifs, démarche, résultats) sera ajoutée prochainement.</p>' : '';
    const voisins = tous.length > 1 ? `<div class="voisins">${rendreVoisin(precedent, 'precedent')}${rendreVoisin(suivant, 'suivant')}</div>` : '';

    conteneur.innerHTML = `
      <div class="container projet-hero${images.length ? '' : ' projet-hero--seul'}">
        <header class="projet-hero__texte">
          <p class="eyebrow">${[type?.label ?? categorie, projet.year].filter(Boolean).map(e).join(' · ')}</p>
          <h1 class="page-tete__titre">${e(projet.title)}</h1>
          ${c.presentation ? `<p class="page-tete__intro">${e(c.presentation)}</p>` : ''}
          ${avis ? `<p class="etude__demo">${avis}</p>` : ''}
          ${bouton}
          ${meta}
        </header>
        ${images.length ? `<div class="projet-hero__visuel">${rendreApercus(images)}</div>` : ''}
      </div>
      <div class="container">
        ${aVenir}
        ${rendreRubriques([
          ['Contexte', paragraphe(c.context)],
          ['Problématique', paragraphe(c.problem)],
          ['Objectifs', liste(c.objectives)],
          ['Démarche', liste(c.approach, 'ol')],
          ['Livrables', liste(c.deliverables)],
          ['Résultats', paragraphe(c.results)],
          ['Ressources', ressources],
        ])}
      </div>
      <nav class="container etude__suite" aria-label="Autres réalisations">
        ${voisins}
      </nav>`;
    activerOnglets(conteneur);
    activerCarrousel(conteneur);
    activerVisionneuse(conteneur);
    ajusterEcran();
    document.fonts.ready.then(ajusterEcran);
    addEventListener('resize', ajusterEcran);
  }
} catch {
  conteneur.innerHTML = '<header class="page-tete container"><h1 class="page-tete__titre">Étude de cas</h1><p class="page-tete__intro">Impossible de charger cette réalisation. Actualisez la page.</p></header>';
}

conteneur.dataset.pret = '';

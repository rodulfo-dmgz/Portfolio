import { getCategories, getProjects } from '../services/contentRepository.js';
import { rendreCarteProjet } from '../components/project-card.js';
import { echapperHtml } from '../scripts/utils.js';

const TOUTES = 'toutes';
const pluriel = new Intl.PluralRules('fr');

const filtres = document.querySelector('[data-rendu="filtres"]');
const galerie = document.querySelector('[data-rendu="galerie"]');
const compte = document.querySelector('[data-compte]');
const vide = document.querySelector('[data-vide]');
const videTitre = document.querySelector('[data-vide-titre]');

try {
  const [categories, projets] = await Promise.all([getCategories(), getProjects()]);
  const nombre = (categorie) => (categorie === TOUTES ? projets.length : projets.filter((p) => p.category === categorie).length);
  const choix = [{ id: TOUTES, label: 'Toutes' }, ...categories];

  const demandee = new URLSearchParams(location.search).get('categorie');
  let actif = categories.some((categorie) => categorie.id === demandee) ? demandee : TOUTES;

  filtres.innerHTML = choix
    .map((categorie) => `<button class="filtre" type="button" data-categorie="${echapperHtml(categorie.id)}" aria-pressed="false">${echapperHtml(categorie.label)} <span class="filtre__nombre">${nombre(categorie.id)}</span></button>`)
    .join('');

  function afficher() {
    const liste = actif === TOUTES ? projets : projets.filter((projet) => projet.category === actif);
    const libelle = choix.find((categorie) => categorie.id === actif).label;
    const mot = pluriel.select(liste.length) === 'one' ? 'réalisation' : 'réalisations';

    for (const bouton of filtres.querySelectorAll('[data-categorie]')) {
      bouton.setAttribute('aria-pressed', String(bouton.dataset.categorie === actif));
    }

    compte.textContent = actif === TOUTES ? `${liste.length} ${mot}` : `${liste.length} ${mot} dans « ${libelle} »`;
    galerie.innerHTML = liste.map((projet, index) => rendreCarteProjet(projet, categories, index, 2)).join('');
    galerie.hidden = liste.length === 0;
    vide.hidden = liste.length > 0;
    videTitre.textContent = `Aucune réalisation dans « ${libelle} »`;
  }

  function choisir(categorie) {
    actif = categorie;
    history.replaceState(null, '', actif === TOUTES ? location.pathname : `?categorie=${actif}`);
    afficher();
  }

  filtres.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-categorie]');
    if (bouton) choisir(bouton.dataset.categorie);
  });

  document.querySelector('[data-vide-action]').addEventListener('click', () => {
    choisir(TOUTES);
    filtres.querySelector(`[data-categorie="${TOUTES}"]`).focus();
  });

  afficher();
} catch {
  galerie.innerHTML = '<p>Impossible de charger les réalisations. Actualisez la page.</p>';
}

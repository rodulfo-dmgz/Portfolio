/**
 * Apparition progressive des sections au défilement.
 * La classe `reveal-ready` n'est posée que si ce script s'exécute : sans lui, rien n'est masqué.
 * Le déclenchement a lieu avant l'entrée à l'écran, pour que le contenu soit déjà en place à l'arrivée.
 */
const CIBLES = [
  'main h2.text-display-md',
  '.filtres', '.projets .projet',
  '.expertise', '.etape',
  '.apropos__portrait', '.apropos__presentation', '.faits',
  '.deux-colonnes > :last-child', '.domaine__grille > .liste-trait', '.domaine__resume',
  '.contact-accueil > :not(h2)', '.contact > *', '.appel > :not(h2)',
  '.etude__visuel', '.etude__fiche', '.etude__section', '.etude__suite',
].join(',');

const PAS_DE_DECALAGE_MS = 60;
const DECALAGE_MAX = 3;

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');

  const suivis = new WeakSet();

  const afficher = (cible, rang = 0) => {
    cible.style.setProperty('--delai', `${Math.min(rang, DECALAGE_MAX) * PAS_DE_DECALAGE_MS}ms`);
    cible.classList.add('est-visible');
    observateur.unobserve(cible);
  };

  const observateur = new IntersectionObserver((entrees) => {
    const entrants = entrees
      .filter((entree) => entree.isIntersecting)
      .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    // Ce qui est déjà passé au-dessus de l'écran (ancre, rechargement) s'affiche sans attendre.
    for (const entree of entrees) {
      if (!entree.isIntersecting && entree.boundingClientRect.top < 0) afficher(entree.target);
    }
    entrants.forEach((entree, rang) => afficher(entree.target, rang));
  }, { threshold: 0, rootMargin: '0px 0px 14% 0px' });

  const inscrire = (noeud) => {
    if (suivis.has(noeud)) return;
    suivis.add(noeud);
    noeud.setAttribute('data-reveal', '');
    observateur.observe(noeud);
  };

  /** Au chargement, ce qui est déjà à l'écran reste affiché tel quel : le masquer après le premier rendu ferait clignoter la page. */
  const dansLEcran = (noeud) => noeud.getBoundingClientRect().top < innerHeight;

  const balayer = (racine, initial = false) => {
    const noeuds = [...racine.querySelectorAll(CIBLES)];
    if (racine.matches?.(CIBLES)) noeuds.unshift(racine);
    for (const noeud of noeuds) {
      if (!(initial && dansLEcran(noeud))) inscrire(noeud);
    }
  };

  balayer(document, true);

  // Les listes sont affichées par les scripts de page après le chargement des données.
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const noeud of mutation.addedNodes) if (noeud.nodeType === Node.ELEMENT_NODE) balayer(noeud);
    }
  }).observe(document.querySelector('main') ?? document.body, { childList: true, subtree: true });
}

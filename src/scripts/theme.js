/**
 * Thème Clair / Sombre / Système.
 * Le choix est mémorisé dans localStorage('rd-theme'), comme dans l'ERP ; le script du <head> applique le thème avant l'affichage.
 * Le nouveau thème se dévoile en cercle depuis le bouton (View Transitions) ; avec « réduire les animations », il apparaît en fondu.
 */
const CLE = 'rd-theme';
const COULEURS_NAVIGATEUR = { clair: '#f8fafc', sombre: '#0f172a' };

const racine = document.documentElement;
const selecteur = document.querySelector('[data-theme-selecteur]');
const boutons = selecteur ? [...selecteur.querySelectorAll('[data-theme-choix]')] : [];
const systemeSombre = matchMedia('(prefers-color-scheme: dark)');
const mouvementReduit = matchMedia('(prefers-reduced-motion: reduce)');

function lireChoix() {
  try {
    const memorise = localStorage.getItem(CLE);
    return memorise === 'light' || memorise === 'dark' ? memorise : 'system';
  } catch {
    return 'system';
  }
}

function memoriser(choix) {
  try {
    localStorage.setItem(CLE, choix);
  } catch {
    // Stockage indisponible : le choix reste valable pour la session.
  }
}

const estSombre = (choix) => (choix === 'system' ? systemeSombre.matches : choix === 'dark');

function afficherChoix(choix) {
  selecteur.dataset.valeur = choix;
  for (const bouton of boutons) {
    const actif = bouton.dataset.themeChoix === choix;
    bouton.setAttribute('aria-checked', String(actif));
    bouton.tabIndex = actif ? 0 : -1;
  }
}

function appliquerClasse(sombre) {
  racine.classList.toggle('dark', sombre);
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.removeAttribute('media');
    meta.content = sombre ? COULEURS_NAVIGATEUR.sombre : COULEURS_NAVIGATEUR.clair;
  }
}

function devoilerEnCercle(origine) {
  const { left, top, width, height } = origine.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const rayon = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  racine.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rayon}px at ${x}px ${y}px)`] },
    { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
  );
}

function appliquer(sombre, origine) {
  if (racine.classList.contains('dark') === sombre) return;
  racine.classList.add('theme-switching');

  if (!document.startViewTransition) {
    appliquerClasse(sombre);
    requestAnimationFrame(() => racine.classList.remove('theme-switching'));
    return;
  }

  const transition = document.startViewTransition(() => appliquerClasse(sombre));
  if (origine && !mouvementReduit.matches) transition.ready.then(() => devoilerEnCercle(origine)).catch(() => {});
  transition.finished.finally(() => racine.classList.remove('theme-switching'));
}

function choisir(choix, origine) {
  memoriser(choix);
  afficherChoix(choix);
  appliquer(estSombre(choix), origine);
}

function surTouche(evenement, index) {
  const deplacements = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  let cible;
  if (evenement.key in deplacements) cible = (index + deplacements[evenement.key] + boutons.length) % boutons.length;
  else if (evenement.key === 'Home') cible = 0;
  else if (evenement.key === 'End') cible = boutons.length - 1;
  else return;
  evenement.preventDefault();
  boutons[cible].focus();
  choisir(boutons[cible].dataset.themeChoix, boutons[cible]);
}

if (selecteur) {
  afficherChoix(lireChoix());
  appliquerClasse(racine.classList.contains('dark'));

  boutons.forEach((bouton, index) => {
    bouton.addEventListener('click', () => choisir(bouton.dataset.themeChoix, bouton));
    bouton.addEventListener('keydown', (evenement) => surTouche(evenement, index));
  });

  systemeSombre.addEventListener('change', () => {
    if (lireChoix() === 'system') appliquer(systemeSombre.matches, null);
  });

  addEventListener('storage', (evenement) => {
    if (evenement.key !== CLE) return;
    const choix = lireChoix();
    afficherChoix(choix);
    appliquer(estSombre(choix), null);
  });
}

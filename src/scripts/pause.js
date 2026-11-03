/**
 * Pause du fond animé (WCAG 2.2.2) : tout mouvement automatique de plus de 5 secondes doit pouvoir être arrêté.
 * Le bouton du pied de page suspend la pluie de lettres, le réseau de points, les mots défilants et le changement de langue
 * des phrases d'accueil. Le choix est mémorisé ; « réduire les animations » les désactive déjà.
 */
const CLE = 'rd-pause-fond';
let pause = false;
try { pause = localStorage.getItem(CLE) === '1'; } catch { /* stockage indisponible */ }

export const enPause = () => pause;

const bouton = document.querySelector('[data-pause-fond]');
const afficher = () => {
  if (bouton) bouton.textContent = pause ? 'Reprendre le fond animé' : 'Mettre en pause le fond animé';
};

bouton?.addEventListener('click', () => {
  pause = !pause;
  try { localStorage.setItem(CLE, pause ? '1' : '0'); } catch { /* stockage indisponible */ }
  afficher();
  document.dispatchEvent(new CustomEvent('fond-pause'));
});

afficher();

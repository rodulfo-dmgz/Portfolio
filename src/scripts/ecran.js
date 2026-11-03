/**
 * Mode « un seul écran » : mêmes seuils que styles/ecran.css.
 * Quand la fenêtre passe d'un mode à l'autre (rotation, redimensionnement), la page est rechargée :
 * les deux dispositions ne partagent pas le même état.
 */
export const ECRAN = matchMedia('(width >= 64rem) and (height >= 40rem)');
export const MOUVEMENT_REDUIT = matchMedia('(prefers-reduced-motion: reduce)');

const mode = ECRAN.matches;
ECRAN.addEventListener('change', () => {
  if (ECRAN.matches !== mode) location.reload();
});

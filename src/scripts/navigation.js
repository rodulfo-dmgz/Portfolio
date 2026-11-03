/** Menu déroulant de l'en-tête (mobile et tablette). Sur grand écran, la navigation est toujours visible. */
const entete = document.querySelector('.site-header');
const bouton = entete?.querySelector('[data-menu-bouton]');
const petitEcran = matchMedia('(width < 56rem)');

if (bouton) {
  const estOuvert = () => bouton.getAttribute('aria-expanded') === 'true';
  const definir = (ouvert) => bouton.setAttribute('aria-expanded', String(ouvert));

  bouton.addEventListener('click', () => definir(!estOuvert()));

  entete.addEventListener('click', (evenement) => {
    if (evenement.target.closest('[data-menu-panneau] a')) definir(false);
  });

  entete.addEventListener('focusout', (evenement) => {
    if (estOuvert() && !entete.contains(evenement.relatedTarget)) definir(false);
  });

  document.addEventListener('click', (evenement) => {
    if (estOuvert() && !entete.contains(evenement.target)) definir(false);
  });

  document.addEventListener('keydown', (evenement) => {
    if (evenement.key !== 'Escape' || !estOuvert()) return;
    definir(false);
    bouton.focus();
  });

  petitEcran.addEventListener('change', () => definir(false));
}

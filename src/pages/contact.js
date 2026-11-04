import { envoiDisponible, envoyerMessage } from '../services/contactService.js';
import { echapperHtml } from '../scripts/utils.js';
import { monterFond } from '../scripts/fond-hero.js';
import { MOUVEMENT_REDUIT } from '../scripts/ecran.js';

const page = document.querySelector('main');
monterFond({ zone: page, orbites: page.querySelector('[data-orbites]'), reduit: MOUVEMENT_REDUIT.matches });

const formulaire = document.querySelector('[data-formulaire]');
const indisponible = document.querySelector('[data-formulaire-indisponible]');

if (envoiDisponible()) {
  formulaire.hidden = false;
  indisponible.hidden = true;
  activerFormulaire();
}

function activerFormulaire() {
  const bouton = formulaire.querySelector('[data-envoyer]');
  const alerte = formulaire.querySelector('[data-alerte]');
  const confirmation = formulaire.querySelector('[data-confirmation]');
  const email = document.querySelector('.contact-accueil__email').textContent.trim();

  const regles = {
    nom: (valeur) => (valeur.trim() ? '' : 'Indiquez votre nom.'),
    email: (valeur) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur.trim()) ? '' : 'Indiquez une adresse email valide, par exemple nom@exemple.fr.'),
    message: (valeur) => (valeur.trim().length >= 10 ? '' : 'Écrivez votre message (10 caractères minimum).'),
  };

  const champ = (nom) => formulaire.elements[nom];
  const erreur = (nom) => formulaire.querySelector(`#erreur-${nom}`);

  function afficherErreur(nom, texte) {
    erreur(nom).textContent = texte;
    erreur(nom).hidden = !texte;
    champ(nom).setAttribute('aria-invalid', String(Boolean(texte)));
  }

  for (const nom of Object.keys(regles)) {
    champ(nom).addEventListener('input', () => {
      if (!erreur(nom).hidden) afficherErreur(nom, regles[nom](champ(nom).value));
    });
  }

  formulaire.addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    alerte.hidden = true;
    confirmation.hidden = true;

    const erreurs = Object.keys(regles).filter((nom) => {
      const texte = regles[nom](champ(nom).value);
      afficherErreur(nom, texte);
      return texte;
    });
    if (erreurs.length) {
      champ(erreurs[0]).focus();
      return;
    }

    bouton.disabled = true;
    bouton.textContent = 'Envoi en cours…';
    const resultat = await envoyerMessage({ nom: champ('nom').value.trim(), email: champ('email').value.trim(), message: champ('message').value.trim() });
    bouton.disabled = false;
    bouton.textContent = 'Envoyer le message';

    if (resultat.ok) {
      formulaire.reset();
      confirmation.textContent = 'Message envoyé. Merci de m’avoir écrit.';
      confirmation.hidden = false;
      return;
    }

    const cause = resultat.raison === 'reseau'
      ? 'Connexion impossible. Vérifiez votre connexion internet, puis réessayez.'
      : 'Le message n’a pas pu être envoyé. Réessayez dans un instant.';
    alerte.innerHTML = `${echapperHtml(cause)} Vous pouvez aussi écrire à <a href="mailto:${echapperHtml(email)}">${echapperHtml(email)}</a>.`;
    alerte.hidden = false;
  });
}

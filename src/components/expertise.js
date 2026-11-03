import flecheSvg from 'iconoir/icons/regular/arrow-right.svg?raw';
import { echapperHtml, icone } from '../scripts/utils.js';

const fleche = icone(flecheSvg);
const COMPETENCES_AFFICHEES = 4;

/** Ligne d'expertise de l'accueil : titre, résumé, quelques compétences et lien vers le détail. */
export function rendreExpertise(domaine) {
  const competences = domaine.competences
    .slice(0, COMPETENCES_AFFICHEES)
    .map((competence) => `<li>${echapperHtml(competence)}</li>`)
    .join('');

  return `
    <article class="expertise">
      <p class="expertise__numero" aria-hidden="true">${echapperHtml(domaine.numero)}</p>
      <div class="expertise__corps">
        <h3 class="expertise__titre">${echapperHtml(domaine.titre)}</h3>
        <p class="expertise__resume">${echapperHtml(domaine.resume)}</p>
        <ul class="etiquettes" role="list" aria-label="Compétences associées">${competences}</ul>
        <a class="lien-fleche" href="/expertises#${echapperHtml(domaine.id)}">Voir le détail<span class="visually-hidden"> de ${echapperHtml(domaine.titre)}</span>${fleche}</a>
      </div>
    </article>`;
}

/** Étape de la méthodologie. */
export function rendreEtape(etape) {
  return `
    <li class="etape">
      <p class="etape__numero" aria-hidden="true">${echapperHtml(etape.numero)}</p>
      <h3 class="etape__titre">${echapperHtml(etape.titre)}</h3>
      <p class="etape__description">${echapperHtml(etape.description)}</p>
    </li>`;
}

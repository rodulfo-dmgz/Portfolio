import { getExpertises, getMethode } from '../services/contentRepository.js';
import { monterFond } from '../scripts/fond-hero.js';
import { MOUVEMENT_REDUIT } from '../scripts/ecran.js';
import { echapperHtml as e } from '../scripts/utils.js';

const rendreEtape = (etape) => `
  <li>
    <p class="methode-bande__numero" aria-hidden="true">${e(etape.numero)}</p>
    <h3>${e(etape.titre)}</h3>
    <p>${e(etape.description)}</p>
  </li>`;

const rendreVolet = (domaine) => `
  <article class="volet" id="${e(domaine.id)}" data-volet>
    <h2 class="volet__titre">
      <button class="volet__bouton" type="button" aria-expanded="false" aria-controls="${e(domaine.id)}-corps">
        <span class="volet__numero" aria-hidden="true">${e(domaine.numero)}</span>
        <span class="volet__nom">${e(domaine.titre)}</span>
        <span class="volet__marque" aria-hidden="true"></span>
      </button>
    </h2>
    <div class="volet__corps" id="${e(domaine.id)}-corps">
      <div class="volet__contenu">
        <p class="volet__grand-titre" aria-hidden="true">${e(domaine.titre)}</p>
        <p class="volet__resume">${e(domaine.resume)}</p>
        <ul class="volet__liste" role="list" aria-label="Compétences : ${e(domaine.titre)}">${domaine.competences.map((competence) => `<li>${e(competence)}</li>`).join('')}</ul>
        <a class="lien-fleche volet__lien" href="/realisations?categorie=${e(domaine.id)}">Réalisations de ce domaine</a>
      </div>
    </div>
  </article>`;

try {
  const [domaines, methode] = await Promise.all([getExpertises(), getMethode()]);
  const volets = document.querySelector('[data-rendu="volets"]');
  volets.innerHTML = domaines.map(rendreVolet).join('');
  document.querySelector('[data-rendu="methode"]').innerHTML = methode.map(rendreEtape).join('');

  const [{ monterVolets }, { monterDefilement }] = await Promise.all([
    import('../components/volets.js'),
    import('../components/defilement.js'),
  ]);
  const demande = decodeURIComponent(location.hash.slice(1));
  monterVolets(volets, domaines.some((domaine) => domaine.id === demande) ? demande : domaines[0].id);
  monterDefilement(document.querySelector('[data-defilement]'));

  const page = document.querySelector('main');
  monterFond({ zone: page, pluie: page.querySelector('[data-pluie]'), orbites: page.querySelector('[data-orbites]'), reduit: MOUVEMENT_REDUIT.matches });
} catch {
  document.querySelector('[data-rendu="volets"]').innerHTML = '<p>Impossible de charger ce contenu. Actualisez la page.</p>';
}

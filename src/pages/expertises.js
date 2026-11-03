import { getExpertises } from '../services/contentRepository.js';
import { echapperHtml } from '../scripts/utils.js';

const e = echapperHtml;

const rendreDomaine = (domaine) => `
  <section class="section container domaine" id="${e(domaine.id)}" aria-labelledby="${e(domaine.id)}-titre">
    <div class="domaine__grille">
      <header class="domaine__tete">
        <p class="eyebrow">${e(domaine.numero)}</p>
        <h2 class="text-display-md" id="${e(domaine.id)}-titre">${e(domaine.titre)}</h2>
        <p class="domaine__resume">${e(domaine.resume)}</p>
        <a class="lien-fleche" href="/realisations?categorie=${e(domaine.id)}">Réalisations de ce domaine</a>
      </header>
      <ul class="liste-trait" role="list" aria-label="Compétences : ${e(domaine.titre)}">${domaine.competences.map((competence) => `<li>${e(competence)}</li>`).join('')}</ul>
    </div>
  </section>`;

try {
  const domaines = await getExpertises();
  document.querySelector('[data-rendu="sommaire"]').innerHTML = domaines
    .map((domaine) => `<li><a href="#${e(domaine.id)}"><span aria-hidden="true">${e(domaine.numero)}</span>${e(domaine.titre)}</a></li>`)
    .join('');
  document.querySelector('[data-rendu="expertises-detail"]').innerHTML = domaines.map(rendreDomaine).join('');

  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
} catch {
  document.querySelector('[data-rendu="expertises-detail"]').innerHTML = '<p class="container">Impossible de charger ce contenu. Actualisez la page.</p>';
}

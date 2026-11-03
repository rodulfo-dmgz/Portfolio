import flecheSvg from 'iconoir/icons/regular/arrow-up-right.svg?raw';
import { echapperHtml, icone } from '../scripts/utils.js';

const fleche = icone(flecheSvg);

/** Carte de réalisation. `index` détermine la teinte de l'emplacement tant que la couverture manque ; `niveau` est le niveau du titre dans la page. */
export function rendreCarteProjet(projet, categories, index, niveau = 3) {
  const categorie = categories.find((c) => c.id === projet.category)?.label ?? '';
  const visuel = projet.cover
    ? `<img class="projet__image" src="${echapperHtml(projet.cover)}" alt="${echapperHtml(projet.coverAlt)}" loading="lazy" decoding="async" />`
    : `<span class="projet__numero" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>`;
  const badge = projet.demo ? '<span class="projet__badge">Contenu de démonstration</span>' : '';

  return `
    <article class="projet" data-ton="${(index % 3) + 1}" style="--i: ${index}">
      <div class="projet__visuel">${visuel}${badge}</div>
      <div class="projet__corps">
        <p class="projet__meta">${[categorie, projet.year].filter(Boolean).map((valeur) => `<span>${echapperHtml(valeur)}</span>`).join('')}</p>
        <h${niveau} class="projet__titre"><a class="projet__lien" href="/realisations/${echapperHtml(projet.slug)}">${echapperHtml(projet.title)}</a></h${niveau}>
        <p class="projet__description">${echapperHtml(projet.description)}</p>
        <span class="projet__plus" aria-hidden="true">${projet.etudeComplete === false ? 'Voir le projet' : "Voir l'étude de cas"}${fleche}</span>
      </div>
    </article>`;
}

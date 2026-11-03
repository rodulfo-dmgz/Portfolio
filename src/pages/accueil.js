import {
  getCategories, getExpertises, getMethode, getProfile, getProjects,
} from '../services/contentRepository.js';
import { rendreCarteProjet } from '../components/project-card.js';
import { rendreEtape, rendreExpertise } from '../components/expertise.js';
import { rendrePortrait } from '../components/portrait.js';
import { echapperHtml } from '../scripts/utils.js';

const remplir = (nom, html) => {
  for (const cible of document.querySelectorAll(`[data-rendu="${nom}"]`)) cible.innerHTML = html;
};

try {
  const [profil, expertises, methode, projets, categories] = await Promise.all([
    getProfile(), getExpertises(), getMethode(), getProjects({ featured: true }), getCategories(),
  ]);

  remplir('portrait', rendrePortrait(profil));
  remplir('projets', projets.map((projet, index) => rendreCarteProjet(projet, categories, index)).join(''));
  remplir('expertises', expertises.map(rendreExpertise).join(''));
  remplir('methode', methode.map(rendreEtape).join(''));
  remplir('presentation', profil.presentation.map((paragraphe) => `<p>${echapperHtml(paragraphe)}</p>`).join(''));
  remplir('faits', profil.faits.map((fait) => `<div><dt>${echapperHtml(fait.libelle)}</dt><dd>${echapperHtml(fait.valeur)}</dd></div>`).join(''));
} catch {
  for (const cible of document.querySelectorAll('[data-rendu]')) {
    cible.innerHTML = '<p>Impossible de charger ce contenu. Actualisez la page.</p>';
  }
}

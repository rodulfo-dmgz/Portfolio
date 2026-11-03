import { getAPropos, getProfile } from '../services/contentRepository.js';
import { rendrePortrait } from '../components/portrait.js';
import { echapperHtml } from '../scripts/utils.js';

const e = echapperHtml;

const remplir = (nom, html) => {
  for (const cible of document.querySelectorAll(`[data-rendu="${nom}"]`)) cible.innerHTML = html;
};

const rendreExperience = (experience) => `
  <li class="experience">
    <p class="experience__periode">${e(experience.periode)}</p>
    <h4 class="experience__role">${e(experience.role)}</h4>
    <p class="experience__structure">${e(experience.structure)}</p>
    ${experience.points.length ? `<ul class="experience__points">${experience.points.map((point) => `<li>${e(point)}</li>`).join('')}</ul>` : ''}
  </li>`;

const rendreChapitre = (chapitre) => `
  <article class="chapitre" id="${e(chapitre.id)}" aria-labelledby="${e(chapitre.id)}-titre">
    <header class="chapitre__tete">
      <p class="chapitre__numero" aria-hidden="true">${e(chapitre.numero)}</p>
      <h3 class="chapitre__lieu" id="${e(chapitre.id)}-titre">${e(chapitre.lieu)}</h3>
      <p class="chapitre__precision">${e(chapitre.precision)}</p>
    </header>
    <div class="chapitre__corps">
      <p class="chapitre__texte">${e(chapitre.texte)}</p>
      <ul class="etiquettes" role="list" aria-label="Compétences développées">${chapitre.competences.map((c) => `<li>${e(c)}</li>`).join('')}</ul>
      <ul class="experiences" role="list">${chapitre.experiences.map(rendreExperience).join('')}</ul>
    </div>
  </article>`;

const rendreGroupeOutils = (groupe) => `
  <section class="outils__groupe">
    <h3>${e(groupe.groupe)}</h3>
    <ul class="etiquettes" role="list">${groupe.elements.map((element) => `<li>${e(element)}</li>`).join('')}</ul>
  </section>`;

const rendreTitreTexte = (element) => `<li><h3>${e(element.titre)}</h3><p>${e(element.texte)}</p></li>`;

try {
  const [profil, contenu] = await Promise.all([getProfile(), getAPropos()]);

  remplir('portrait', rendrePortrait(profil));
  remplir('intro', contenu.intro.map((paragraphe) => `<p>${e(paragraphe)}</p>`).join(''));
  remplir('faits', profil.faits.map((fait) => `<div><dt>${e(fait.libelle)}</dt><dd>${e(fait.valeur)}</dd></div>`).join(''));
  remplir('chapitres', contenu.chapitres.map(rendreChapitre).join(''));
  remplir('approche-texte', contenu.approche.paragraphes.map((paragraphe) => `<p>${e(paragraphe)}</p>`).join(''));
  remplir('principes', contenu.approche.principes.map(rendreTitreTexte).join(''));
  remplir('valeurs', contenu.approche.valeurs.map(rendreTitreTexte).join(''));
  remplir('competences', contenu.competencesTransversales.map((competence) => `<li>${e(competence)}</li>`).join(''));
  remplir('outils', contenu.outils.map(rendreGroupeOutils).join(''));
  remplir('passions', contenu.passions.map(rendreTitreTexte).join(''));

  const cv = document.querySelector('[data-cv]');
  if (profil.cv && cv) {
    cv.href = profil.cv;
    cv.setAttribute('download', '');
    cv.hidden = false;
  }
} catch {
  for (const cible of document.querySelectorAll('[data-rendu]')) {
    cible.innerHTML = '<p>Impossible de charger ce contenu. Actualisez la page.</p>';
  }
}

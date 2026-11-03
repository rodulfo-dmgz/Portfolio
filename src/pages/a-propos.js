import { getAPropos, getProfile } from '../services/contentRepository.js';
import { rendrePortrait } from '../components/portrait.js';
import { echapperHtml as e } from '../scripts/utils.js';

const liste = (elements, classe = '') => `<ul class="${classe}" role="list">${elements.map((element) => `<li>${element}</li>`).join('')}</ul>`;
const titreTexte = (element) => `<li><h3>${e(element.titre)}</h3><p>${e(element.texte)}</p></li>`;

const rendreExperience = (experience) => `
  <li class="experience">
    <p class="experience__periode">${e(experience.periode)}</p>
    <h4 class="experience__role">${e(experience.role)}</h4>
    <p class="experience__structure">${e(experience.structure)}</p>
    ${experience.points.length ? `<ul class="experience__points">${experience.points.map((point) => `<li>${e(point)}</li>`).join('')}</ul>` : ''}
  </li>`;

const rendreLangue = (langue) => `
  <li class="langue" lang="${e(langue.code)}">
    <p class="langue__salut" aria-hidden="true">${e(langue.salut)}</p>
    <h3 class="langue__nom" lang="fr">${e(langue.langue)}</h3>
    <p class="langue__niveau" lang="fr">${e(langue.niveau)}</p>
    <p class="langue__echelle" role="img" lang="fr" aria-label="Niveau ${langue.rang} sur 6">${Array.from({ length: 6 }, (_, i) => `<span${i < langue.rang ? ' class="est-plein"' : ''}></span>`).join('')}</p>
  </li>`;

const rendrePassion = (passion, rang) => `
  <li class="passion">
    <div class="passion__visuel">${passion.photo
    ? `<img src="${e(passion.photo.src)}" alt="${e(passion.photo.alt)}" loading="lazy" decoding="async" />`
    : (import.meta.env.DEV ? '<span>Photo à venir</span>' : '')}</div>
    <p class="passion__numero" aria-hidden="true">${String(rang + 1).padStart(2, '0')}</p>
    <h3>${e(passion.titre)}</h3>
    <p>${e(passion.texte)}</p>
  </li>`;

const rendreChapitre = (chapitre) => `
  <section class="exp-colonne" aria-labelledby="exp-${e(chapitre.id)}">
    <h3 id="exp-${e(chapitre.id)}"><span aria-hidden="true">${e(chapitre.numero)}</span> ${e(chapitre.lieu)}</h3>
    <ul class="experiences" role="list">${chapitre.experiences.map(rendreExperience).join('')}</ul>
  </section>`;

try {
  const [profil, contenu] = await Promise.all([getProfile(), getAPropos()]);

  const sujets = [
    {
      id: 'presentation',
      titre: 'Présentation',
      large: true,
      html: `
        <div class="presentation">
          <div class="portrait presentation__portrait">${rendrePortrait(profil)}</div>
          <div>
            ${contenu.intro.map((paragraphe) => `<p>${e(paragraphe)}</p>`).join('')}
            <dl class="faits">${profil.faits.map((fait) => `<div><dt>${e(fait.libelle)}</dt><dd>${e(fait.valeur)}</dd></div>`).join('')}</dl>
            <div class="presentation__actions">
              <a class="btn btn--cta" href="/realisations">Voir les réalisations</a>
              <a class="btn btn--outline" href="/contact">Me contacter</a>
              ${profil.cv ? `<a class="btn btn--outline" href="${e(profil.cv)}" download>Télécharger mon CV</a>` : ''}
            </div>
          </div>
        </div>`,
    },
    { id: 'experiences', titre: 'Expériences', large: true, html: `<div class="experiences-grille">${contenu.chapitres.map(rendreChapitre).join('')}</div>` },
    { id: 'langues', titre: 'Langues', large: true, html: `<ul class="langues" role="list">${contenu.langues.map(rendreLangue).join('')}</ul>` },
    {
      id: 'vision',
      titre: 'Vision',
      large: true,
      html: `
        <div class="vision">
          <div class="vision__texte">${contenu.approche.paragraphes.map((paragraphe) => `<p>${e(paragraphe)}</p>`).join('')}</div>
          <div>
            <h3>Principes</h3>
            <ul class="principes" role="list">${contenu.approche.principes.map(titreTexte).join('')}</ul>
            <h3>Valeurs</h3>
            <ul class="valeurs" role="list">${contenu.approche.valeurs.map(titreTexte).join('')}</ul>
          </div>
        </div>`,
    },
    { id: 'competences', titre: 'Compétences', html: liste(contenu.competencesTransversales.map(e), 'liste-trait') },
    {
      id: 'outils',
      titre: 'Outils',
      large: true,
      html: `<div class="outils">${contenu.outils.map((groupe) => `<section class="outils__groupe"><h3>${e(groupe.groupe)}</h3>${liste(groupe.elements.map(e), 'etiquettes')}</section>`).join('')}</div>`,
    },
    { id: 'passions', titre: 'Passions', large: true, html: `<ul class="passions" role="list">${contenu.passions.map(rendrePassion).join('')}</ul>` },
  ];

  const voyage = document.querySelector('[data-voyage]');
  const { monterVoyage } = await import('../components/voyage.js');
  monterVoyage(voyage, contenu.chapitres, sujets);
} catch {
  document.querySelector('[data-voyage]').innerHTML = '<p class="container">Impossible de charger ce contenu. Actualisez la page.</p>';
}

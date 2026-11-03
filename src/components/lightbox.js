import fermerSvg from 'iconoir/icons/regular/xmark.svg?raw';
import precedenteSvg from 'iconoir/icons/regular/arrow-left.svg?raw';
import suivanteSvg from 'iconoir/icons/regular/arrow-right.svg?raw';
import { icone } from '../scripts/utils.js';

let dialogue;
let images = [];
let courant = 0;

function creer() {
  dialogue = document.createElement('dialog');
  dialogue.className = 'visionneuse';
  dialogue.setAttribute('aria-label', 'Visionneuse d’images');
  dialogue.innerHTML = `
    <button class="visionneuse__fermer" type="button" aria-label="Fermer la visionneuse">${icone(fermerSvg)}</button>
    <figure class="visionneuse__figure">
      <img class="visionneuse__image" alt="" />
      <figcaption class="visionneuse__legende"></figcaption>
    </figure>
    <button class="visionneuse__nav visionneuse__nav--precedente" type="button" aria-label="Image précédente">${icone(precedenteSvg)}</button>
    <button class="visionneuse__nav visionneuse__nav--suivante" type="button" aria-label="Image suivante">${icone(suivanteSvg)}</button>
    <p class="visionneuse__compteur" role="status"></p>`;
  document.body.append(dialogue);

  dialogue.addEventListener('click', (evenement) => {
    if (evenement.target === dialogue || evenement.target.closest('.visionneuse__fermer')) dialogue.close();
    else if (evenement.target.closest('.visionneuse__nav--precedente')) afficher(courant - 1);
    else if (evenement.target.closest('.visionneuse__nav--suivante')) afficher(courant + 1);
  });

  dialogue.addEventListener('keydown', (evenement) => {
    if (images.length < 2) return;
    if (evenement.key === 'ArrowLeft') afficher(courant - 1);
    else if (evenement.key === 'ArrowRight') afficher(courant + 1);
  });
}

function afficher(index) {
  courant = (index + images.length) % images.length;
  const { src, alt, legende } = images[courant];
  const image = dialogue.querySelector('.visionneuse__image');
  const texte = dialogue.querySelector('.visionneuse__legende');

  image.src = src;
  image.alt = alt;
  texte.textContent = legende;
  texte.hidden = !legende;
  dialogue.querySelector('.visionneuse__compteur').textContent = images.length > 1 ? `${courant + 1} sur ${images.length}` : '';
  for (const bouton of dialogue.querySelectorAll('.visionneuse__nav')) bouton.hidden = images.length < 2;
}

/** Les images de `conteneur` marquées `data-agrandir` (valeur : adresse de la grande version) s'ouvrent dans une visionneuse. */
export function activerVisionneuse(conteneur) {
  const declencheurs = [...conteneur.querySelectorAll('[data-agrandir]')];
  if (!declencheurs.length) return;

  images = declencheurs.map((declencheur) => ({
    src: declencheur.dataset.agrandir,
    alt: declencheur.querySelector('img')?.alt ?? '',
    legende: declencheur.closest('figure')?.querySelector('figcaption')?.textContent ?? '',
  }));

  declencheurs.forEach((declencheur, index) => {
    declencheur.addEventListener('click', () => {
      if (!dialogue) creer();
      afficher(index);
      dialogue.showModal();
    });
  });
}

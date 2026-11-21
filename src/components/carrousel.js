import precedenteSvg from 'iconoir/icons/regular/arrow-left.svg?raw';
import suivanteSvg from 'iconoir/icons/regular/arrow-right.svg?raw';
import { echapperHtml as e, icone } from '../scripts/utils.js';

/**
 * Aperçus d'un projet : un carrousel à défilement natif (CSS scroll-snap), donc fluide au doigt, à la molette et au pavé tactile.
 * Boutons précédent / suivant, points cliquables, flèches du clavier, annonce « Image 2 sur 3 » ; une image seule s'affiche sans commandes.
 * Un clic sur une image l'agrandit dans la visionneuse (components/lightbox.js).
 */
export function rendreApercus(images) {
  const plusieurs = images.length > 1;
  const diapos = images
    .map((image, rang) => `
      <li class="apercus__diapo" role="group" aria-roledescription="diapositive" aria-label="Image ${rang + 1} sur ${images.length}">
        <button class="galerie-etude__agrandir apercus__image" type="button" data-agrandir="${e(image.grande ?? image.src)}" aria-label="Agrandir l’image : ${e(image.alt ?? '')}">
          <img src="${e(image.src)}" alt="${e(image.alt ?? '')}" ${rang ? 'loading="lazy"' : ''} decoding="async" />
        </button>
      </li>`)
    .join('');

  const commandes = plusieurs ? `
    <div class="apercus__commandes">
      <button class="apercus__fleche" type="button" data-pas="-1" aria-label="Image précédente">${icone(precedenteSvg)}</button>
      <div class="apercus__points">${images.map((_, rang) => `<button class="apercus__point" type="button" data-aller="${rang}" aria-label="Aller à l’image ${rang + 1}"></button>`).join('')}</div>
      <button class="apercus__fleche" type="button" data-pas="1" aria-label="Image suivante">${icone(suivanteSvg)}</button>
    </div>
    <p class="visually-hidden" role="status" data-annonce></p>` : '';

  return `
    <section class="apercus" aria-roledescription="carrousel" aria-label="Aperçus du projet" data-carrousel>
      <ul class="apercus__piste" role="list">${diapos}</ul>
      ${commandes}
    </section>`;
}

export function activerCarrousel(racine) {
  for (const carrousel of racine.querySelectorAll('[data-carrousel]')) {
    const piste = carrousel.querySelector('.apercus__piste');
    const diapos = [...piste.children];
    const boutons = [...carrousel.querySelectorAll('[data-aller]')];
    const precedent = carrousel.querySelector('[data-pas="-1"]');
    const suivant = carrousel.querySelector('[data-pas="1"]');
    const annonce = carrousel.querySelector('[data-annonce]');
    if (diapos.length < 2) continue;

    carrousel.classList.add('apercus--actif');
    let courant = 0;
    const calme = matchMedia('(prefers-reduced-motion: reduce)');

    const afficher = (rang) => {
      courant = rang;
      diapos.forEach((diapo, i) => diapo.classList.toggle('est-active', i === rang));
      boutons.forEach((bouton, i) => bouton.setAttribute('aria-current', String(i === rang)));
      precedent.disabled = rang === 0;
      suivant.disabled = rang === diapos.length - 1;
      annonce.textContent = `Image ${rang + 1} sur ${diapos.length}`;
    };

    const aller = (rang) => {
      const cible = Math.min(diapos.length - 1, Math.max(0, rang));
      piste.scrollTo({ left: cible * piste.clientWidth, behavior: calme.matches ? 'auto' : 'smooth' });
    };

    // L'image la plus visible devient l'image courante, que l'on défile au doigt ou avec les boutons.
    let attente = 0;
    piste.addEventListener('scroll', () => {
      cancelAnimationFrame(attente);
      attente = requestAnimationFrame(() => {
        const rang = Math.round(piste.scrollLeft / piste.clientWidth);
        if (rang !== courant) afficher(rang);
      });
    }, { passive: true });

    carrousel.addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('button');
      if (!bouton) return;
      if (bouton.dataset.pas) aller(courant + Number(bouton.dataset.pas));
      else if (bouton.dataset.aller !== undefined) aller(Number(bouton.dataset.aller));
    });

    carrousel.addEventListener('keydown', (evenement) => {
      const sens = { ArrowRight: 1, ArrowLeft: -1 }[evenement.key];
      if (!sens) return;
      evenement.preventDefault();
      aller(courant + sens);
    });

    afficher(0);
  }
}

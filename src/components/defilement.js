import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { enPause } from '../scripts/pause.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Bandeaux de mots qui défilent à l'horizontale (typographie cinétique). Le défilement de la page accélère le
 * mouvement et en inverse le sens quand on remonte. Le texte est décoratif : il n'est pas lu par les lecteurs d'écran.
 * Avec « réduire les animations », les bandeaux restent immobiles.
 */
export function monterDefilement(racine) {
  if (!racine || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pistes = [...racine.querySelectorAll('[data-piste]')];
  const boucles = pistes.map((piste) => {
    // Le contenu est doublé : la boucle recule d'une moitié exacte, sans saut visible.
    const texte = piste.textContent;
    piste.textContent = '';
    for (let i = 0; i < 2; i += 1) {
      const copie = document.createElement('span');
      // Le texte est dessiné par le CSS (contenu généré) : un simple décor, sans texte à contraster ni à lire.
      copie.dataset.texte = texte.repeat(3);
      piste.append(copie);
    }
    const sens = piste.dataset.sens === '1' ? 1 : -1;
    return gsap.fromTo(piste, { xPercent: sens === 1 ? -50 : 0 }, { xPercent: sens === 1 ? 0 : -50, duration: 50, ease: 'none', repeat: -1 });
  });

  const suivre = () => boucles.forEach((boucle) => (enPause() ? boucle.pause() : boucle.play()));
  document.addEventListener('fond-pause', suivre);
  if (enPause()) suivre();

  ScrollTrigger.create({
    trigger: racine,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => boucles.forEach((boucle) => (self.isActive && !enPause() ? boucle.play() : boucle.pause())),
    onUpdate: (self) => {
      if (enPause()) return;
      const facteur = (self.direction === 1 ? 1 : -1) * (1 + Math.min(7, Math.abs(self.getVelocity()) / 350));
      gsap.timeline()
        .to(boucles, { timeScale: facteur, duration: 0.2, overwrite: true })
        .to(boucles, { timeScale: 1, duration: 1.2, ease: 'power2.out' }, 0.2);
    },
  });
}

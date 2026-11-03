import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

/**
 * Effets typographiques des pages (GSAP) :
 * - le titre de page monte lettre par lettre depuis un masque, texte net du début à la fin ;
 * - les libellés `[data-scramble]` se composent par caractères aléatoires qui deviennent le texte final.
 */
document.fonts.ready.then(() => {
  for (const titre of document.querySelectorAll('.page-tete__titre')) {
    const decoupe = SplitText.create(titre, { type: 'lines,chars', mask: 'lines' });
    gsap.set(titre, { opacity: 1 });
    gsap.from(decoupe.chars, {
      yPercent: 115,
      duration: 0.8,
      ease: 'expo.out',
      stagger: 0.022,
      onComplete: () => decoupe.revert(),
    });
  }

  for (const libelle of document.querySelectorAll('[data-scramble]')) {
    const texte = libelle.textContent;
    gsap.to(libelle, { duration: 0.9, delay: 0.15, scrambleText: { text: texte, chars: 'upperCase', speed: 0.7 } });
  }
});

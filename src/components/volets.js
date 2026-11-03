import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/**
 * Volets des expertises : un seul ouvert à la fois. L'ouverture (largeur sur grand écran, hauteur sur petit) est
 * portée par le CSS ; GSAP compose le contenu du volet qui s'ouvre : résumé qui monte depuis un masque, compétences
 * l'une après l'autre. Le survol ne fait qu'éclaircir le volet : l'ouverture se fait au clic, au toucher ou au clavier.
 */
export function monterVolets(racine, ouvertId) {
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const volets = [...racine.querySelectorAll('[data-volet]')];
  const large = matchMedia('(width >= 64rem)');
  let decoupe = null;

  const composer = (volet) => {
    if (reduit) return;
    decoupe?.revert();
    const resume = volet.querySelector('.volet__resume');
    decoupe = SplitText.create(resume, { type: 'lines', mask: 'lines' });
    gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.12 })
      .from(volet.querySelector('.volet__grand-titre'), { yPercent: 30, opacity: 0, duration: 0.7 }, 0)
      .from(decoupe.lines, { yPercent: 110, duration: 0.7, stagger: 0.07 }, 0.05)
      .from(volet.querySelectorAll('.volet__liste li'), { x: -14, opacity: 0, duration: 0.5, stagger: 0.045 }, 0.15)
      .from(volet.querySelector('.volet__lien'), { opacity: 0, y: 10, duration: 0.5 }, 0.45)
      .add(() => { decoupe?.revert(); decoupe = null; });
  };

  const ouvrir = (volet) => {
    if (volet.hasAttribute('data-ouvert')) return;
    for (const autre of volets) {
      const actif = autre === volet;
      autre.toggleAttribute('data-ouvert', actif);
      autre.querySelector('.volet__bouton').setAttribute('aria-expanded', String(actif));
    }
    composer(volet);
  };

  const fermer = (volet) => {
    volet.removeAttribute('data-ouvert');
    volet.querySelector('.volet__bouton').setAttribute('aria-expanded', 'false');
  };

  racine.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('.volet__bouton');
    if (!bouton) return;
    const volet = bouton.closest('[data-volet]');
    // Petit écran : le bouton ouvre et ferme ; grand écran : un volet reste toujours ouvert.
    if (volet.hasAttribute('data-ouvert') && !large.matches) fermer(volet);
    else ouvrir(volet);
  });

  racine.addEventListener('keydown', (evenement) => {
    const bouton = evenement.target.closest('.volet__bouton');
    const sens = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[evenement.key];
    if (!bouton || !sens) return;
    evenement.preventDefault();
    const boutons = volets.map((volet) => volet.querySelector('.volet__bouton'));
    boutons[(boutons.indexOf(bouton) + sens + boutons.length) % boutons.length].focus();
  });

  const initial = racine.querySelector(`#${CSS.escape(ouvertId)}`) ?? volets[0];
  initial.setAttribute('data-ouvert', '');
  initial.querySelector('.volet__bouton').setAttribute('aria-expanded', 'true');

  // Les volets entrent l'un après l'autre au premier affichage.
  if (!reduit) {
    gsap.from(volets, { yPercent: 8, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, clearProps: 'transform,opacity' });
  }
}

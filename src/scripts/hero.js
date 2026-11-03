import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { getProfile } from '../services/contentRepository.js';
import { monterFond } from './fond-hero.js';
import { monterMots } from './mots-pop.js';
import { monterOndes } from './ondes.js';
import { enPause } from './pause.js';

gsap.registerPlugin(SplitText);

/**
 * Hero (GSAP) : le portrait se révèle au centre, les anneaux s'ouvrent, les trois phrases montent depuis un masque
 * et leur trait se déploie jusqu'au portrait. Ensuite, en fond, une pluie de lettres et des pistes orbitales tournent
 * autour du portrait, les phrases changent de langue (français, espagnol, anglais) lettre par lettre, et le pointeur
 * fait apparaître des mots en « pop » et, à la souris, de douces ondes émeraude naissent à chaque arrêt du pointeur. Avec « réduire les animations », rien ne bouge.
 */
const scene = document.querySelector('[data-scene]');
const zone = scene?.closest('.hero-zone');
const hero = scene?.closest('.hero');
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hero && zone) {
  const choisir = (selecteur) => hero.querySelectorAll(selecteur);
  const grand = matchMedia('(width >= 56rem)').matches;

  const orbites = hero.querySelector('[data-orbites]');
  const pluie = zone.querySelector('[data-pluie]');
  const profil = await getProfile().catch(() => null);

  monterFond({ zone, pluie, orbites, reduit });
  monterOndes(zone);
  monterMots(zone);

  if (!reduit) {
    const textes = choisir('.ligne__texte');
    const traits = choisir('.phrase__trait');
    const index = choisir('.phrase__index');
    const portrait = hero.querySelector('.hero__portrait');
    const anneaux = hero.querySelector('[data-anneaux]');
    const reste = [...choisir('.hero__eyebrow, .hero__intro, .hero__domaines, .hero__defiler')];

    gsap.set(textes, { yPercent: 108, opacity: 1 });
    gsap.set([...index, ...traits, anneaux, portrait, ...reste].filter(Boolean), { opacity: 0 });
    gsap.set(traits, { scaleX: 0, opacity: 1 });
    gsap.set([orbites, pluie].filter(Boolean), { opacity: 0 });

    const ligne = gsap.timeline({ defaults: { ease: 'expo.out' } });

    ligne
      .fromTo(portrait, { autoAlpha: 0, scale: 0.9, clipPath: 'inset(12% 12% 12% 12% round 1.5rem)' },
        { autoAlpha: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 1rem)', duration: 1, clearProps: 'clipPath' }, 0)
      .fromTo(reste[0], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.05)
      .to(textes, { yPercent: 0, duration: 0.8, stagger: 0.14 }, 0.25)
      .to(index, { autoAlpha: 1, duration: 0.4, stagger: 0.14 }, 0.3)
      .to(traits, { scaleX: 1, duration: 0.9, stagger: 0.14, ease: 'power3.inOut' }, 0.45)
      .to(reste.slice(1), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.65)
      .to([orbites, pluie].filter(Boolean), { opacity: 1, duration: 1.6, ease: 'power2.out' }, 0.5);

    if (anneaux && grand) {
      ligne.fromTo(anneaux, { autoAlpha: 0, scale: 0.82, rotation: -24 },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.4, ease: 'power3.out' }, 0.1);
    }
    gsap.set(reste.slice(1), { y: 18 });

    // Les phrases changent de langue, lettre par lettre, tant que le hero est à l'écran.
    const langues = [
      { lang: 'fr', phrases: [...textes].map((texte) => texte.textContent.trim()) },
      ...(profil?.accrocheLangues ?? []),
    ];
    if (langues.length > 1) {
      let courante = 0;
      let visible = true;
      let attente = gsap.delayedCall(10, changer);

      new IntersectionObserver(([entree]) => { visible = entree.isIntersecting; }).observe(zone);

      function changer() {
        if (!visible || document.hidden || enPause()) {
          attente = gsap.delayedCall(2, changer);
          return;
        }
        courante = (courante + 1) % langues.length;
        const { lang, phrases } = langues[courante];

        textes.forEach((texte, rang) => {
          const sortie = SplitText.create(texte, { type: 'words,chars' });
          gsap.timeline()
            .to(sortie.chars, {
              rotationX: -90, opacity: 0, transformPerspective: 500, stagger: 0.012, duration: 0.28, ease: 'power2.in',
            })
            .add(() => {
              sortie.revert();
              texte.textContent = phrases[rang];
              texte.lang = lang;
              const entree = SplitText.create(texte, { type: 'words,chars' });
              gsap.fromTo(entree.chars,
                { rotationX: 90, opacity: 0, transformPerspective: 500 },
                { rotationX: 0, opacity: 1, stagger: 0.016, duration: 0.45, ease: 'back.out(1.6)', onComplete: () => entree.revert() });
            });
        });

        attente = gsap.delayedCall(courante === 0 ? 14 : 10, changer);
      }
    }
  }
}

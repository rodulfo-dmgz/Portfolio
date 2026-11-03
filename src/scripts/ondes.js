import { gsap } from 'gsap';
import { enPause } from './pause.js';

/**
 * « Ondes » : quand le pointeur s'arrête après avoir bougé, deux cercles émeraude très pâles s'étendent lentement depuis
 * lui et disparaissent, comme une goutte dans l'eau. Rien ne se passe tant que la souris bouge.
 * Dessin sur un canvas décoratif derrière le contenu ; réservé à la souris et au stylet ; figé avec la pause du fond.
 */
const DUREE = 2.6; // secondes pour qu'une onde s'étende et disparaisse
const RAYON_MAX = 110; // px
const ATTENTE = 220; // ms d'immobilité avant l'onde
const DISTANCE_MIN = 24; // px parcourus avant de déclencher l'onde suivante

export function monterOndes(zone) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'fond-particules';
  canvas.setAttribute('aria-hidden', 'true');
  zone.append(canvas);
  const ctx = canvas.getContext('2d');

  let largeur = 1;
  let hauteur = 1;
  const mesurer = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    largeur = zone.clientWidth;
    hauteur = zone.clientHeight;
    canvas.width = largeur * dpr;
    canvas.height = hauteur * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(mesurer).observe(zone);
  mesurer();

  let couleur = '#16766c';
  const lireCouleur = () => {
    const sombre = document.documentElement.classList.contains('dark');
    couleur = getComputedStyle(document.documentElement).getPropertyValue(sombre ? '--color-secondary-400' : '--color-secondary-600').trim() || couleur;
  };
  lireCouleur();
  new MutationObserver(lireCouleur).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const ondes = [];

  const pas = (_, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    ctx.clearRect(0, 0, largeur, hauteur);
    ctx.strokeStyle = couleur;
    for (let i = ondes.length - 1; i >= 0; i -= 1) {
      const onde = ondes[i];
      onde.age += dt;
      if (onde.age >= DUREE) { ondes.splice(i, 1); continue; }
      if (onde.age < 0) continue; // la deuxième onde part un peu après la première
      const avance = onde.age / DUREE;
      const sortie = 1 - (1 - avance) ** 3; // l'onde ralentit en s'étendant
      ctx.globalAlpha = 0.34 * (1 - avance) ** 1.6;
      ctx.lineWidth = 1.1 - 0.5 * avance;
      ctx.beginPath();
      ctx.arc(onde.x, onde.y, 4 + RAYON_MAX * sortie * onde.echelle, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (!ondes.length) gsap.ticker.remove(pas);
  };

  const lancer = (x, y) => {
    ondes.push({ x, y, age: 0, echelle: 1 }, { x, y, age: -0.4, echelle: 0.65 });
    gsap.ticker.remove(pas);
    gsap.ticker.add(pas);
  };

  // Une onde naît à chaque arrêt du pointeur, s'il a parcouru une distance suffisante depuis la dernière.
  let minuteur = 0;
  let depart = null;
  zone.addEventListener('pointermove', (evenement) => {
    if (evenement.pointerType === 'touch') return;
    const cadre = zone.getBoundingClientRect();
    const x = evenement.clientX - cadre.left;
    const y = evenement.clientY - cadre.top;
    depart ??= { x, y };
    clearTimeout(minuteur);
    minuteur = setTimeout(() => {
      if (enPause() || document.hidden || Math.hypot(x - depart.x, y - depart.y) < DISTANCE_MIN) return;
      depart = { x, y };
      lancer(x, y);
    }, ATTENTE);
  });
  zone.addEventListener('pointerleave', () => { clearTimeout(minuteur); depart = null; });

  document.addEventListener('fond-pause', () => { if (enPause()) gsap.ticker.remove(pas); else if (ondes.length) gsap.ticker.add(pas); });
}

import { gsap } from 'gsap';
import { enPause } from './pause.js';

/**
 * Fond : une pluie lente de lettres et de formes (trois profondeurs) et, autour du portrait, un réseau de points qui tourne.
 * Tout passe par des transformations, sur un seul ticker GSAP qui s'arrête hors écran et quand l'onglet est caché.
 */
const LETTRES = 'PÉDAGOGIEFORMATIONMÉTHODEDESIGN{}</>#01λ∑+=×';
const FORMES = ['cercle', 'anneau', 'carre', 'croix'];
const VITESSES = [14, 26, 44];

const pioche = (liste) => liste[Math.floor(Math.random() * liste.length)];

/** Pluie de lettres et de formes. Renvoie la fonction qui redimensionne et celle qui avance d'un pas. */
function creerPluie(racine, nombre) {
  const gouttes = Array.from({ length: nombre }, (_, i) => {
    const profondeur = i % 3;
    const el = document.createElement('span');
    el.className = `goutte goutte--p${profondeur}`;
    const tirage = Math.random();
    if (tirage < 0.2) {
      el.classList.add('goutte--forme', `goutte--${pioche(FORMES)}`);
    } else {
      el.textContent = pioche([...LETTRES]);
    }
    if (Math.random() < 0.16) el.classList.add('goutte--accent');
    racine.append(el);
    return {
      el,
      x: Math.random(),
      y: Math.random(),
      vitesse: VITESSES[profondeur] * (0.8 + Math.random() * 0.4),
      phase: Math.random() * Math.PI * 2,
      angle: (Math.random() - 0.5) * 24,
    };
  });

  let largeur = 1;
  let hauteur = 1;
  const placer = (goutte, t) => {
    const dx = Math.sin(t * 0.5 + goutte.phase) * 8;
    goutte.el.style.transform = `translate3d(${goutte.x * largeur + dx}px, ${goutte.y * hauteur}px, 0) rotate(${goutte.angle}deg)`;
  };

  return {
    mesurer() {
      largeur = racine.clientWidth;
      hauteur = racine.clientHeight;
    },
    avancer(t, dt) {
      for (const goutte of gouttes) {
        goutte.y += (goutte.vitesse * dt) / hauteur;
        if (goutte.y > 1.04) {
          goutte.y = -0.04;
          goutte.x = Math.random();
        }
        placer(goutte, t);
      }
    },
    figer() {
      this.mesurer();
      gouttes.forEach((goutte) => placer(goutte, 0));
    },
  };
}

/**
 * Réseau « intelligence artificielle » autour du portrait : des points répartis sur une sphère qui tourne lentement,
 * reliés à leurs voisins, avec de petites impulsions émeraude qui circulent d'un point à l'autre.
 * Dessin sur canvas ; plus un point est « devant », plus il est net.
 */
function creerReseau(racine, petit) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;inline-size:100%;block-size:100%';
  racine.append(canvas);
  const ctx = canvas.getContext('2d');

  const nombre = petit ? 36 : 72;
  const noeuds = Array.from({ length: nombre }, (_, i) => {
    // Répartition régulière sur la sphère (spirale de Fibonacci).
    const y = 1 - (2 * (i + 0.5)) / nombre;
    const r = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r, accent: i % 11 === 0 };
  });

  // Chaque point est relié à ses trois voisins les plus proches : les liens ne changent pas pendant la rotation.
  const liens = [];
  noeuds.forEach((n, i) => {
    noeuds
      .map((m, j) => ({ j, d: (n.x - m.x) ** 2 + (n.y - m.y) ** 2 + (n.z - m.z) ** 2 }))
      .filter(({ j }) => j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) => { if (!liens.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) liens.push([i, j]); });
  });

  const impulsions = [];
  let encre = '#12355b';
  let accent = '#16766c';
  const lireCouleurs = () => {
    const style = getComputedStyle(document.documentElement);
    encre = style.getPropertyValue('--text-primary').trim() || encre;
    accent = style.getPropertyValue(document.documentElement.classList.contains('dark') ? '--color-secondary-400' : '--color-secondary-600').trim() || accent;
  };
  lireCouleurs();
  new MutationObserver(lireCouleurs).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  let taille = 1;
  let angle = 0;
  let prochaine = 0;

  const dessiner = (dt, t) => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(taille * dpr)) {
      canvas.width = Math.round(taille * dpr);
      canvas.height = Math.round(taille * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, taille, taille);

    angle += dt * 0.16;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const inclinaison = 0.35;
    const ci = Math.cos(inclinaison);
    const si = Math.sin(inclinaison);
    const rayon = taille * 0.46;
    const c = taille / 2;

    const pts = noeuds.map((n) => {
      const x = n.x * ca + n.z * sa;
      const z0 = -n.x * sa + n.z * ca;
      const y = n.y * ci - z0 * si;
      const z = n.y * si + z0 * ci;
      const perspective = 1 / (1.7 - z * 0.5);
      return { px: c + x * rayon * perspective * 1.7, py: c + y * rayon * perspective * 1.7, z, profondeur: (z + 1) / 2 };
    });

    ctx.lineWidth = 1;
    ctx.strokeStyle = encre;
    for (const [a, b] of liens) {
      const profondeur = (pts[a].profondeur + pts[b].profondeur) / 2;
      ctx.globalAlpha = 0.04 + 0.2 * profondeur;
      ctx.beginPath();
      ctx.moveTo(pts[a].px, pts[a].py);
      ctx.lineTo(pts[b].px, pts[b].py);
      ctx.stroke();
    }

    // Impulsions : un point lumineux traverse un lien, puis s'éteint.
    if (t > prochaine && impulsions.length < (petit ? 2 : 4)) {
      impulsions.push({ lien: liens[Math.floor(Math.random() * liens.length)], avance: 0, sens: Math.random() < 0.5 });
      prochaine = t + 0.5 + Math.random() * 0.9;
    }
    for (let i = impulsions.length - 1; i >= 0; i -= 1) {
      const p = impulsions[i];
      p.avance += dt * 0.9;
      if (p.avance >= 1) { impulsions.splice(i, 1); continue; }
      const [a, b] = p.sens ? p.lien : [p.lien[1], p.lien[0]];
      const x = pts[a].px + (pts[b].px - pts[a].px) * p.avance;
      const y = pts[a].py + (pts[b].py - pts[a].py) * p.avance;
      ctx.globalAlpha = 0.9 * Math.sin(Math.PI * p.avance);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    noeuds.forEach((n, i) => {
      const p = pts[i];
      ctx.globalAlpha = 0.25 + 0.65 * p.profondeur;
      ctx.fillStyle = n.accent ? accent : encre;
      ctx.beginPath();
      ctx.arc(p.px, p.py, 1.2 + 1.6 * p.profondeur, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  return {
    mesurer() { taille = racine.clientWidth; },
    avancer(t, dt) { dessiner(dt, t); },
    figer() { this.mesurer(); dessiner(0, 0); },
  };
}

/**
 * Monte le fond. `pluie` et `orbites` sont les conteneurs ; `zone` sert à suspendre l'animation hors écran.
 * Avec « réduire les animations », les objets sont posés une fois et ne bougent pas.
 */
export function monterFond({ zone, pluie, orbites, reduit }) {
  const petit = matchMedia('(width < 56rem)').matches;
  const moteurs = [];

  if (pluie) moteurs.push(creerPluie(pluie, petit ? 14 : 34));
  if (orbites) moteurs.push(creerReseau(orbites, petit));

  const mesurer = () => moteurs.forEach((moteur) => moteur.mesurer());

  if (reduit) {
    moteurs.forEach((moteur) => moteur.figer());
    return;
  }

  mesurer();
  const figerTout = () => moteurs.forEach((moteur) => moteur.figer());
  new ResizeObserver(() => { mesurer(); if (enPause()) figerTout(); }).observe(zone);

  let t = 0;
  const pas = (_, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    t += dt;
    for (const moteur of moteurs) moteur.avancer(t, dt);
  };

  let visible = true;
  const mettreAJour = () => {
    gsap.ticker.remove(pas);
    if (visible && !document.hidden && !enPause()) gsap.ticker.add(pas);
    else if (enPause()) figerTout();
  };

  new IntersectionObserver(([entree]) => {
    visible = entree.isIntersecting;
    mettreAJour();
  }).observe(zone);
  document.addEventListener('visibilitychange', mettreAJour);
  document.addEventListener('fond-pause', mettreAJour);
  mettreAJour();
}

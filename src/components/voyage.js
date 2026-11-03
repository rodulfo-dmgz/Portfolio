import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import carte from '../data/carte.json';
import { ECRAN, MOUVEMENT_REDUIT } from '../scripts/ecran.js';
import { echapperHtml as e } from '../scripts/utils.js';

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * Page « À propos » : une seule vue, sans défilement. Une carte (points sur les terres, repères de coordonnées) où un avion
 * vole du Chiapas à Montpellier, l'étape se change par les boutons, la molette, les flèches ou un balayage.
 * Les autres sujets (présentation, expériences, langues, vision, compétences, outils, passions) s'ouvrent en panneaux sur la carte.
 * Sur un écran trop petit, la carte devient une image fixe et tout se lit à la suite en défilant.
 */
const PAYS = { mexique: 'MX', 'guinee-equatoriale': 'GQ', france: 'FR' };
const borner = (valeur, min = 0, max = 1) => Math.min(max, Math.max(min, valeur));
const melanger = (a, b, t) => a + (b - a) * t;

/** Route en arc entre deux villes : la courbe se bombe d'un quart de sa longueur. */
function arc(a, b, signe) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const longueur = Math.hypot(dx, dy);
  const cx = (a.x + b.x) / 2 + signe * (dy / longueur) * longueur * 0.25;
  const cy = (a.y + b.y) / 2 - signe * (dx / longueur) * longueur * 0.25;
  return { d: `M${a.x} ${a.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`, distance: longueur };
}

const VITESSE_CROISIERE = 850; // km/h, avion de ligne
const nomLieu = (chapitre) => chapitre.precision.split(',')[0];

/** Distance à vol d'oiseau entre deux étapes, en km (formule de haversine). */
function distance(a, b) {
  const rad = (degres) => (degres * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** Durée de vol estimée : distance à vol d'oiseau à vitesse de croisière, plus une demi-heure de montée et de descente. */
const rendreVol = (precedent, chapitre) => {
  const km = distance(precedent, chapitre);
  const heures = Math.round(km / VITESSE_CROISIERE + 0.5);
  return `<div><dt>Vol depuis ${e(nomLieu(precedent))}</dt><dd>environ ${heures}&nbsp;h <span class="voyage__detail">(${nombre.format(Math.round(km / 10) * 10)}&nbsp;km à vol d’oiseau)</span></dd></div>`;
};

/** Heure locale d'un fuseau, au format 24 h. */
const heureLocale = (fuseau, date = new Date()) => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: fuseau }).format(date);

/** Écart entre l'heure du lieu et celle du visiteur, au demi-heure près. */
function ecartAvecVisiteur(fuseau, date = new Date()) {
  const dans = (options) => new Date(date.toLocaleString('en-US', options));
  const heures = Math.round(((dans({ timeZone: fuseau }) - dans({})) / 36e5) * 2) / 2;
  if (heures === 0) return 'même heure que chez vous';
  const valeur = `${Math.abs(heures).toString().replace('.', ',')} h`;
  return heures > 0 ? `${valeur} d’avance sur vous` : `${valeur} de retard sur vous`;
}

const rendrePhotos = (chapitre) => {
  if (chapitre.photos?.length) {
    return chapitre.photos
      .slice(0, 3)
      .map((photo) => `<figure class="voyage__photo"><img src="${e(photo.src)}" alt="${e(photo.alt)}" loading="lazy" decoding="async" /></figure>`)
      .join('');
  }
  return import.meta.env.DEV
    ? '<figure class="voyage__photo voyage__photo--vide"><span>Photo à venir</span></figure>'
    : '';
};

const rendreEtape = (chapitre, rang, total, precedent) => `
  <article class="voyage__etape" data-etape="${rang}" aria-labelledby="voyage-${e(chapitre.id)}">
    <div class="voyage__texte">
      <p class="voyage__numero"><span>${e(chapitre.numero)}</span> / ${String(total).padStart(2, '0')}</p>
      <h2 class="voyage__lieu" id="voyage-${e(chapitre.id)}">${e(chapitre.lieu)}</h2>
      <p class="voyage__precision">${e(chapitre.precision)}</p>
      <p class="voyage__resume">${e(chapitre.texte)}</p>
      <dl class="voyage__infos">
        <div><dt>Heure locale</dt><dd><time data-heure="${e(chapitre.fuseau)}">${heureLocale(chapitre.fuseau)}</time> <span class="voyage__detail" data-ecart="${e(chapitre.fuseau)}">(${ecartAvecVisiteur(chapitre.fuseau)})</span></dd></div>
        ${precedent ? rendreVol(precedent, chapitre) : ''}
      </dl>
      <ul class="etiquettes" role="list" aria-label="Compétences développées">${chapitre.competences.map((c) => `<li>${e(c)}</li>`).join('')}</ul>
    </div>
    <div class="voyage__photos">${rendrePhotos(chapitre)}</div>
  </article>`;

const rendreSujet = (sujet) => `
  <section class="sujet${sujet.large ? ' sujet--large' : ''}" id="sujet-${e(sujet.id)}" data-sujet="${e(sujet.id)}" role="region" aria-labelledby="sujet-${e(sujet.id)}-titre" tabindex="-1" hidden>
    <header class="sujet__tete">
      <h2 class="sujet__titre" id="sujet-${e(sujet.id)}-titre">${e(sujet.titre)}</h2>
      <button class="sujet__fermer" type="button" data-fermer-sujet aria-label="Fermer : ${e(sujet.titre)}"><span aria-hidden="true">×</span></button>
    </header>
    <div class="sujet__corps">${sujet.html}</div>
  </section>`;

export function monterVoyage(racine, chapitres, sujets) {
  const reduit = MOUVEMENT_REDUIT.matches;
  const statique = !ECRAN.matches;
  const scene = racine.querySelector('.voyage__scene');
  const conteneur = racine.querySelector('[data-carte]');
  const monde = racine.querySelector('[data-monde]');
  const reperes = racine.querySelector('[data-reperes]');
  const avion = racine.querySelector('[data-avion]');
  const position = racine.querySelector('[data-position]');
  const rail = racine.querySelector('[data-rail]');
  const etapes = racine.querySelector('[data-etapes]');
  const nav = racine.querySelector('[data-sujets]');
  const panneaux = racine.querySelector('[data-panneaux]');
  const annonce = racine.querySelector('[data-annonce]');
  const indice = racine.querySelector('.voyage__indice');

  const villes = chapitres.map((chapitre) => carte.villes[chapitre.ville]);
  const routes = [arc(villes[0], villes[1], 1), arc(villes[1], villes[2], -1)];

  monde.setAttribute('viewBox', `0 0 ${carte.largeur} ${carte.hauteur}`);
  monde.innerHTML = `
    <defs>
      <pattern id="voyage-points" width="4.5" height="4.5" patternUnits="userSpaceOnUse"><circle cx="2.25" cy="2.25" r="0.62" /></pattern>
      <pattern id="voyage-grille" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" /></pattern>
    </defs>
    <rect class="voyage__grille" width="${carte.largeur}" height="${carte.hauteur}" fill="url(#voyage-grille)" />
    <path class="voyage__terre" d="${carte.terre}" fill="url(#voyage-points)" />
    <path class="voyage__cote" d="${carte.terre}" />
    ${routes.map((route) => `<path class="voyage__route" d="${route.d}" />`).join('')}
    ${routes.map((route) => `<path class="voyage__trace" d="${route.d}" />`).join('')}`;

  const chemins = [...monde.querySelectorAll('.voyage__route')];
  const traces = [...monde.querySelectorAll('.voyage__trace')];
  const longueurs = chemins.map((chemin) => chemin.getTotalLength());
  traces.forEach((trace, i) => {
    trace.style.strokeDasharray = longueurs[i];
    trace.style.strokeDashoffset = longueurs[i];
  });

  reperes.innerHTML = chapitres
    .map((chapitre) => `<div class="repere" data-repere><span class="repere__point"></span><span class="repere__nom">${e(chapitre.precision.split(',')[0])} · ${PAYS[chapitre.id] ?? ''}</span></div>`)
    .join('');
  const marques = [...reperes.children];

  etapes.innerHTML = chapitres.map((chapitre, rang) => rendreEtape(chapitre, rang, chapitres.length, chapitres[rang - 1])).join('');
  const cartes = [...etapes.children];

  // L'heure des trois lieux se met à jour chaque minute.
  const majHeures = () => {
    const maintenant = new Date();
    for (const element of etapes.querySelectorAll('[data-heure]')) element.textContent = heureLocale(element.dataset.heure, maintenant);
    for (const element of etapes.querySelectorAll('[data-ecart]')) element.textContent = `(${ecartAvecVisiteur(element.dataset.ecart, maintenant)})`;
  };
  setInterval(majHeures, 30000);

  rail.innerHTML = `
    <button class="voyage__fleche" type="button" data-pas="-1" aria-label="Étape précédente"><span aria-hidden="true">←</span></button>
    <ol>${chapitres.map((chapitre, rang) => `<li><button type="button" data-aller="${rang}" aria-label="Aller à l’étape ${e(chapitre.numero)} : ${e(chapitre.lieu)}"><span>${e(chapitre.numero)}</span><span class="voyage__rail-nom">${e(chapitre.lieu)}</span></button></li>`).join('')}</ol>
    <button class="voyage__fleche" type="button" data-pas="1" aria-label="Étape suivante"><span aria-hidden="true">→</span></button>`;
  const boutons = [...rail.querySelectorAll('[data-aller]')];

  panneaux.innerHTML = sujets.map(rendreSujet).join('');
  nav.innerHTML = sujets
    .map((sujet) => `<button type="button" data-ouvrir="${e(sujet.id)}" aria-expanded="false" aria-controls="sujet-${e(sujet.id)}">${e(sujet.titre)}</button>`)
    .join('');

  let largeur = 1;
  let hauteur = 1;
  let etroit = false;
  let derniere = -1;
  let courant = 0;
  // Avancement du vol : 0 sur la première ville, 1 sur la deuxième, 2 sur la troisième.
  // `cap` ajoute un demi-tour à l'avion quand on revient en arrière : il garde le nez dans le sens de son déplacement.
  const etat = { a: 0, cap: 0 };

  function rendre() {
    const a = statique ? 1 : etat.a;
    const i = Math.min(Math.floor(a), 1);
    const f = statique ? 0.5 : a - i;
    const longueur = longueurs[i];

    const point = chemins[i].getPointAtLength(f * longueur);
    const avant = chemins[i].getPointAtLength(Math.min(longueur, f * longueur + 3));
    const arriere = chemins[i].getPointAtLength(Math.max(0, f * longueur - 3));
    const angle = (Math.atan2(avant.y - arriere.y, avant.x - arriere.x) * 180) / Math.PI;

    // Caméra : zoom serré sur les étapes, plan large en vol ; la ville reste à droite de la carte de texte.
    const proche = etroit ? 230 : 280;
    const large = statique ? 600 : Math.max(380, routes[i].distance * 1.9);
    const vw = statique ? large : melanger(proche, large, Math.sin(Math.PI * f));
    const vh = (vw * hauteur) / largeur;
    const cx = statique ? (villes[0].x + villes[2].x) / 2 : point.x - (etroit ? 0 : 0.14) * vw;
    const cy = statique ? (villes[0].y + villes[2].y) / 2 : point.y + (etroit ? 0.2 : 0) * vh;
    const vx = cx - vw / 2;
    const vy = cy - vh / 2;
    monde.setAttribute('viewBox', `${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);

    const ecran = (x, y) => [((x - vx) / vw) * largeur, ((y - vy) / vh) * hauteur];

    const [ax, ay] = ecran(point.x, point.y);
    gsap.set(avion, { x: ax, y: ay, rotation: angle + 90 + etat.cap, opacity: statique ? 0 : 1 });

    traces.forEach((trace, rang) => {
      trace.style.strokeDashoffset = longueurs[rang] * (1 - (statique ? 1 : borner(a - rang)));
    });

    villes.forEach((ville, rang) => {
      const [x, y] = ecran(ville.x, ville.y);
      gsap.set(marques[rang], { x, y });
      const distance = statique ? 0 : Math.abs(a - rang);
      marques[rang].classList.toggle('est-actif', distance < 0.14);
      marques[rang].classList.toggle('est-passe', statique || a > rang + 0.14);
      if (statique) return;
      const proximite = borner(1 - (distance - 0.1) / 0.16);
      gsap.set(cartes[rang], { opacity: proximite, y: (a - rang) * -60, visibility: proximite > 0.02 ? 'visible' : 'hidden' });
    });
  }

  function afficherPosition(rang) {
    const texte = `${chapitres[rang].numero} / 0${chapitres.length} — ${chapitres[rang].coordonnees}`;
    if (reduit) position.textContent = texte;
    else gsap.to(position, { duration: 0.8, scrambleText: { text: texte, chars: '0123456789°NSEO·', speed: 0.8 } });
  }

  function aller(rang) {
    rang = borner(rang, 0, chapitres.length - 1);
    if (rang === courant && derniere === rang) return;
    const ecart = Math.abs(rang - etat.a);
    const enArriere = rang < courant;
    courant = rang;
    derniere = rang;
    indice?.classList.add('est-masque');
    boutons.forEach((bouton, i) => bouton.setAttribute('aria-current', String(i === rang)));
    afficherPosition(rang);
    annonce.textContent = `Étape ${chapitres[rang].numero} sur 0${chapitres.length} : ${chapitres[rang].lieu}`;
    gsap.killTweensOf(etat);
    if (reduit) {
      etat.a = rang;
      etat.cap = 0;
      rendre();
      return;
    }
    // Demi-tour doux au départ, puis un seul mouvement continu (accélération, croisière, freinage).
    gsap.to(etat, { cap: enArriere ? 180 : 0, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(etat, { a: rang, duration: 3.4 + ecart * 1.2, ease: 'sine.inOut', onUpdate: rendre });
  }

  // ── Sujets (panneaux) ──
  let ouvert = null;
  const panneau = (id) => panneaux.querySelector(`[data-sujet="${CSS.escape(id)}"]`);

  function fermerSujet(rendreLeFocus = true) {
    if (!ouvert) return;
    const id = ouvert;
    const element = panneau(id);
    const bouton = nav.querySelector(`[data-ouvrir="${CSS.escape(id)}"]`);
    ouvert = null;
    scene.removeAttribute('data-sujet');
    bouton.setAttribute('aria-expanded', 'false');
    const fin = () => { element.hidden = true; };
    if (rendreLeFocus && element.contains(document.activeElement)) bouton.focus();
    if (reduit) fin();
    else gsap.to(element, { opacity: 0, x: 30, duration: 0.25, ease: 'power2.in', onComplete: fin });
  }

  function ouvrirSujet(id) {
    if (ouvert === id) { fermerSujet(); return; }
    if (ouvert) fermerSujet(false);
    ouvert = id;
    const element = panneau(id);
    scene.dataset.sujet = id;
    nav.querySelector(`[data-ouvrir="${CSS.escape(id)}"]`).setAttribute('aria-expanded', 'true');
    gsap.killTweensOf(element);
    element.hidden = false;
    if (!reduit) {
      gsap.fromTo(element, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.55, ease: 'expo.out', clearProps: 'transform' });
      gsap.from(element.querySelectorAll('.sujet__corps li, .sujet__corps p, .sujet__corps dl > div, .sujet__corps .langue, .sujet__corps .passion, .sujet__corps h3'), {
        y: 14, opacity: 0, duration: 0.5, ease: 'expo.out', stagger: 0.03, delay: 0.12, clearProps: 'transform,opacity',
      });
    }
    element.focus({ preventScroll: true });
  }

  const mesurer = () => {
    const cadre = conteneur.getBoundingClientRect();
    largeur = cadre.width || 1;
    hauteur = cadre.height || 1;
    etroit = innerWidth < 1100;
  };

  mesurer();
  new ResizeObserver(() => { mesurer(); rendre(); }).observe(conteneur);

  if (statique) {
    racine.classList.add('voyage--liste');
    for (const element of panneaux.children) element.hidden = false;
    rendre();
    return;
  }

  rail.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('button');
    if (!bouton) return;
    if (bouton.dataset.aller !== undefined) aller(Number(bouton.dataset.aller));
    else if (bouton.dataset.pas) aller(courant + Number(bouton.dataset.pas));
  });

  nav.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-ouvrir]');
    if (bouton) ouvrirSujet(bouton.dataset.ouvrir);
  });

  panneaux.addEventListener('click', (evenement) => {
    if (evenement.target.closest('[data-fermer-sujet]')) fermerSujet();
  });

  document.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Escape' && ouvert) { fermerSujet(); return; }
    const sens = { ArrowRight: 1, ArrowLeft: -1 }[evenement.key];
    if (!sens || evenement.target.closest('input, textarea, select')) return;
    aller(courant + sens);
  });

  // Molette : une impulsion change d'étape (sauf dans un panneau, qui garde sa propre molette).
  let verrou = 0;
  racine.addEventListener('wheel', (evenement) => {
    if (evenement.target.closest('.sujet') || Math.abs(evenement.deltaY) < 12) return;
    evenement.preventDefault();
    const maintenant = performance.now();
    if (maintenant - verrou < 900) return;
    verrou = maintenant;
    aller(courant + Math.sign(evenement.deltaY));
  }, { passive: false });

  // Balayage tactile ou au stylet sur la carte.
  let depart = null;
  conteneur.addEventListener('pointerdown', (evenement) => { if (evenement.pointerType !== 'mouse') depart = evenement.clientX; });
  conteneur.addEventListener('pointerup', (evenement) => {
    if (depart === null) return;
    const dx = evenement.clientX - depart;
    depart = null;
    if (Math.abs(dx) > 60) aller(courant + (dx < 0 ? 1 : -1));
  });

  afficherPosition(0);
  derniere = 0;
  boutons[0].setAttribute('aria-current', 'true');
  rendre();
}

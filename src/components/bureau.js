import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { echapperHtml as e } from '../scripts/utils.js';

gsap.registerPlugin(Draggable, ScrollTrigger);

/**
 * « Mon ordinateur » : un bureau avec un raccourci par projet en ligne et un navigateur intégré à l'écran.
 * Le bureau est dessiné à une taille fixe (1280 × 800, ou 520 × 700 sur petit écran) puis mis à l'échelle de l'écran :
 * les projets s'y affichent en version ordinateur, quelle que soit la largeur de la page.
 * Les commandes à taille réelle (ouvrir dans un nouvel onglet, fermer) sont sous l'écran.
 * GSAP : entrée des raccourcis, ouverture depuis le raccourci, fenêtre déplaçable, agrandissement, fermeture.
 */
const BARRE = 32;
const DOCK = 72;
const BAC_A_SABLE = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';

const lienDemo = (projet) => projet.content?.resources?.find((ressource) => ressource.type === 'demo')?.url ?? null;
const initiales = (titre) => titre.split(/\s+/).map((mot) => mot[0]).join('').slice(0, 2).toUpperCase();

export function monterBureau(racine, projets, categorie = null) {
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ecran = racine.querySelector('[data-ecran]');
  const aide = racine.querySelector('[data-aide]');
  const actions = racine.querySelector('[data-actions]');
  const externe = racine.querySelector('[data-externe]');
  const etude = racine.querySelector('[data-etude]');
  const aideInitiale = categorie ? `Domaine : ${categorie.label}. Cliquez sur un raccourci pour l’ouvrir.` : aide.textContent;
  aide.textContent = aideInitiale;

  const liste = projets.filter((projet) => !categorie || projet.category === categorie.id).map((projet) => ({ projet, url: lienDemo(projet) })).filter(({ url }) => url);
  if (!liste.length) {
    racine.hidden = true;
    return;
  }

  const petit = matchMedia('(width < 48rem)');
  let L = 1280;
  let H = 800;
  const dimensionner = () => {
    [L, H] = petit.matches ? [520, 700] : [1280, 800];
    ecran.style.setProperty('--vl', L);
    ecran.style.setProperty('--vh', H);
  };
  dimensionner();

  ecran.innerHTML = `
    <div class="bureau" data-surface>
      <div class="bureau__fond" aria-hidden="true"><span>RD FORMATION</span></div>
      <div class="bureau__barre">
        <span class="bureau__marque" aria-hidden="true">RD</span>
        <span>Bureau</span>
        <time data-horloge></time>
      </div>
      <ul class="bureau__icones" role="list">
        ${liste.map(({ projet }, rang) => `
          <li>
            <button class="raccourci" type="button" data-slug="${e(projet.slug)}" style="--teinte:${rang % 4}">
              <span class="raccourci__tuile" aria-hidden="true">${e(initiales(projet.title))}</span>
              <span class="raccourci__nom">${e(projet.title)}</span>
            </button>
          </li>`).join('')}
      </ul>

      <section class="navigateur" data-nav aria-label="Navigateur" hidden>
        <header class="navigateur__titre" data-poignee>
          <div class="navigateur__feux" aria-hidden="true"><span class="feu feu--fermer" data-feu="fermer"></span><span class="feu feu--reduire" data-feu="reduire"></span><span class="feu feu--agrandir" data-feu="agrandir"></span></div>
          <div class="navigateur__onglets" role="tablist" aria-label="Onglets" data-onglets></div>
        </header>
        <div class="navigateur__outils">
          <span class="navigateur__bouton" aria-hidden="true">↻</span>
          <p class="navigateur__adresse" data-adresse></p>
        </div>
        <div class="navigateur__page" data-page>
          <div class="navigateur__chargement" data-chargement></div>
          <p class="navigateur__vide" data-vide>Choisissez un raccourci sur le bureau.</p>
        </div>
      </section>

      <nav class="bureau__dock" aria-label="Applications">
        <button class="dock__app" type="button" data-dock-nav aria-label="Navigateur" aria-pressed="false"><span aria-hidden="true">◐</span></button>
        <a class="dock__app" href="/a-propos" aria-label="À propos"><span aria-hidden="true">RD</span></a>
        <a class="dock__app" href="/contact" aria-label="Contact"><span aria-hidden="true">@</span></a>
      </nav>
    </div>`;

  const surface = ecran.querySelector('[data-surface]');
  const nav = ecran.querySelector('[data-nav]');
  const onglets = ecran.querySelector('[data-onglets]');
  const adresse = ecran.querySelector('[data-adresse]');
  const page = ecran.querySelector('[data-page]');
  const chargement = ecran.querySelector('[data-chargement]');
  const vide = ecran.querySelector('[data-vide]');
  const dock = ecran.querySelector('[data-dock-nav]');
  const horloge = ecran.querySelector('[data-horloge]');

  const heure = () => { horloge.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
  heure();
  setInterval(heure, 30000);

  const echelle = () => {
    const rapport = ecran.clientWidth / L;
    surface.style.transform = `scale(${rapport})`;
    ecran.style.blockSize = `${H * rapport}px`;
  };
  new ResizeObserver(echelle).observe(ecran);
  petit.addEventListener('change', () => { dimensionner(); agrandi = petit.matches; placer(); echelle(); });
  echelle();

  // ── Fenêtre du navigateur ──
  let ouverts = [];
  let actif = null;
  let agrandi = petit.matches;
  const par = new Map(liste.map(({ projet, url }) => [projet.slug, { projet, url }]));

  const geometrie = () => (agrandi || petit.matches
    ? { left: 0, top: BARRE, width: L, height: H - BARRE - DOCK }
    : { left: 270, top: 56, width: 900, height: 620 });

  function placer() {
    gsap.set(nav, { ...geometrie(), x: 0, y: 0 });
    pilote.forEach((p) => (agrandi || petit.matches ? p.disable() : p.enable()));
  }

  const pilote = Draggable.create(nav, {
    trigger: ecran.querySelector('[data-poignee]'),
    bounds: surface,
    edgeResistance: 0.85,
    allowEventDefault: false,
    dragClickables: false,
  });

  function afficherOnglets() {
    onglets.innerHTML = ouverts.map((slug) => `
      <div class="onglet" role="presentation">
        <button class="onglet__titre" type="button" role="tab" aria-selected="${slug === actif}" data-onglet="${e(slug)}">${e(par.get(slug).projet.title)}</button>
        <button class="onglet__fermer" type="button" aria-label="Fermer l’onglet ${e(par.get(slug).projet.title)}" data-fermer="${e(slug)}">×</button>
      </div>`).join('');
  }

  function activer(slug) {
    actif = slug;
    const { projet, url } = par.get(slug);
    for (const cadre of page.querySelectorAll('iframe')) cadre.hidden = cadre.dataset.slug !== slug;
    vide.hidden = true;
    adresse.textContent = url.replace(/^https?:\/\//, '');
    afficherOnglets();
    externe.href = url;
    etude.href = `/realisations/${projet.slug}`;
    aide.textContent = `${projet.title} est ouvert dans le navigateur de l’ordinateur.`;
    actions.hidden = false;
  }

  function ouvrirOnglet(slug) {
    if (!ouverts.includes(slug)) {
      ouverts.push(slug);
      const cadre = document.createElement('iframe');
      cadre.dataset.slug = slug;
      cadre.title = par.get(slug).projet.title;
      cadre.src = par.get(slug).url;
      cadre.setAttribute('sandbox', BAC_A_SABLE);
      cadre.setAttribute('referrerpolicy', 'no-referrer');
      cadre.addEventListener('load', () => gsap.to(chargement, { scaleX: 1, duration: 0.2, onComplete: () => gsap.to(chargement, { opacity: 0, duration: 0.3 }) }));
      page.append(cadre);
      gsap.set(chargement, { scaleX: 0, opacity: 1 });
      if (!reduit) gsap.to(chargement, { scaleX: 0.85, duration: 2.2, ease: 'power2.out' });
    }
    activer(slug);
  }

  function ouvrirNav(depuis) {
    const etaitOuvert = !nav.hidden;
    nav.hidden = false;
    dock.setAttribute('aria-pressed', 'true');
    if (etaitOuvert) return;
    placer();
    if (reduit) return;
    const cadre = nav.getBoundingClientRect();
    const rapport = ecran.clientWidth / L;
    const origine = depuis
      ? `${(depuis.left + depuis.width / 2 - cadre.left) / rapport}px ${(depuis.top + depuis.height / 2 - cadre.top) / rapport}px`
      : '50% 100%';
    gsap.fromTo(nav, { scale: 0.35, opacity: 0, transformOrigin: origine }, { scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out', clearProps: 'scale,opacity,transformOrigin' });
  }

  function fermerNav() {
    if (nav.hidden) return;
    const fin = () => {
      nav.hidden = true;
      dock.setAttribute('aria-pressed', 'false');
      for (const cadre of page.querySelectorAll('iframe')) cadre.remove();
      ouverts = [];
      actif = null;
      vide.hidden = false;
      actions.hidden = true;
      aide.textContent = aideInitiale;
    };
    if (reduit) { fin(); return; }
    gsap.to(nav, { scale: 0.6, opacity: 0, transformOrigin: '50% 100%', duration: 0.35, ease: 'power3.in', onComplete: () => { fin(); gsap.set(nav, { clearProps: 'scale,opacity,transformOrigin' }); } });
  }

  function basculerTaille() {
    if (petit.matches) return;
    agrandi = !agrandi;
    const cible = geometrie();
    pilote.forEach((p) => (agrandi ? p.disable() : p.enable()));
    gsap.to(nav, { ...cible, x: 0, y: 0, duration: reduit ? 0 : 0.5, ease: 'expo.out' });
  }

  function fermerOnglet(slug) {
    ouverts = ouverts.filter((autre) => autre !== slug);
    page.querySelector(`iframe[data-slug="${CSS.escape(slug)}"]`)?.remove();
    if (!ouverts.length) { fermerNav(); return; }
    activer(ouverts.at(-1));
  }

  ecran.addEventListener('click', (evenement) => {
    const raccourci = evenement.target.closest('.raccourci');
    if (raccourci) {
      ouvrirNav(raccourci.getBoundingClientRect());
      ouvrirOnglet(raccourci.dataset.slug);
      return;
    }
    const fermer = evenement.target.closest('[data-fermer]');
    if (fermer) { fermerOnglet(fermer.dataset.fermer); return; }
    const onglet = evenement.target.closest('[data-onglet]');
    if (onglet) { activer(onglet.dataset.onglet); return; }
    const feu = evenement.target.closest('[data-feu]');
    if (feu) {
      if (feu.dataset.feu === 'fermer' || feu.dataset.feu === 'reduire') fermerNav();
      else basculerTaille();
      return;
    }
    if (evenement.target.closest('[data-dock-nav]')) {
      if (nav.hidden) ouvrirNav(null); else fermerNav();
    }
  });

  nav.addEventListener('dblclick', (evenement) => {
    if (evenement.target.closest('[data-poignee]') && !evenement.target.closest('.onglet')) basculerTaille();
  });

  racine.querySelector('[data-fermer-nav]')?.addEventListener('click', fermerNav);
  ecran.addEventListener('keydown', (evenement) => { if (evenement.key === 'Escape') fermerNav(); });

  // Entrée des raccourcis au défilement.
  if (!reduit) {
    gsap.from(ecran.querySelectorAll('.raccourci'), {
      y: 18, opacity: 0, scale: 0.85, duration: 0.6, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,opacity',
      scrollTrigger: { trigger: ecran, start: 'top 80%', once: true },
    });
  }
}

import { gsap } from 'gsap';
import { enPause } from './pause.js';

/**
 * Mots du métier qui apparaissent en « pop » un peu partout dans le fond de l'accueil : ils grossissent d'un coup,
 * flottent vers le haut et s'effacent en quelques secondes. Texte seul, en plusieurs tailles : plus un mot est grand, plus il est transparent. Dessin sur un canvas décoratif placé derrière le contenu.
 * Ils s'arrêtent avec le bouton de pause du fond et avec « réduire les animations ».
 */
const MOTS = [
  // --- FR : Ingénierie Pédagogique & Formation ---
  'Pédagogie', 'Scénarisation', 'Moodle', 'SCORM', 'Qualiopi', 'Évaluation', 'Digital learning', 'Parcours',
  'Blended learning', 'Gamification', 'Classe inversée', 'H5P', 'IA', 'Learning analytics', 'Référentiels',
  'RNCP', 'TOSA', 'Ingénierie', 'Analyse des besoins', 'Accompagnement', 'Apprentissage synchrone',
  'Apprentissage asynchrone', 'Modalité pédagogique', 'Présentiel enrichi', 'FOAD', 'Tutorat en ligne',
  'Cognitivisme', 'Constructivisme', 'Connectivisme', 'Taxonomie de Bloom', 'Objectifs pédagogiques',
  'Compétences clés', 'Bloc de compétences', 'Certification professionnelle', 'Titre professionnel',
  'Alternance', 'Contrat d’apprentissage', 'Contrat de professionnalisation', 'CPF', 'OPCO',
  'Veille pédagogique', 'Accessibilité numérique', 'RGPD en formation', 'Design thinking', 'UX learning',
  'Micro-learning', 'Mobile learning', 'Podcast pédagogique', 'Classe virtuelle', 'Webinaire',
  'Serious game', 'Escape game pédagogique', 'Présentation interactive', 'Carte mentale',
  'Scénario catastrophe', 'Étude de cas', 'Mise en situation', 'Role-play', 'Feedback constructif',
  'Grille d’évaluation', 'Auto-évaluation', 'Évaluation formative', 'Évaluation sommative',
  'Certification externe', 'Badge numérique', 'Portefeuille de compétences', 'LMS', 'LXP',
  'Auteur multimédia', 'Outil auteur', 'Articulate Storyline', 'Adobe Captivate', 'Camtasia',
  'Genially', 'Canva pour l’éducation', 'Notion', 'Trello', 'Slack', 'Microsoft Teams', 'Zoom',
  'Google Workspace', 'Base de données', 'Tableau de bord', 'Indicateur de performance', 'Taux de complétion',
  'Taux de réussite', 'Satisfaction stagiaire', 'Suivi asynchrone', 'API d’apprentissage', 'xAPI',
  'Tin Can API', 'Interopérabilité', 'Norme LTI', 'Sécurité des données', 'Hébergement cloud',
  'Migration LMS', 'Charte graphique', 'Ergonomie visuelle', 'Contraste des couleurs', 'Typographie web',

  // --- EN : Instructional Design & E-Learning ---
  'Instructional design', 'Curriculum mapping', 'Learning management system', 'E-learning authoring',
  'Microlearning', 'Mobile learning', 'Blended learning', 'Flipped classroom', 'Synchronous learning',
  'Asynchronous learning', 'Learner engagement', 'Knowledge retention', 'Cognitive load theory',
  'ADDIE model', 'SAM model', 'Backward design', 'Learning objectives', 'Performance metrics',
  'Formative assessment', 'Summative assessment', 'Peer review', 'Rubric', 'Gamification',
  'Serious games', 'Storyboarding', 'Audio narration', 'Video production', 'Screencasting',
  'Podcasting', 'Interactive simulation', 'Branching scenario', 'Drag and drop interaction',
  'Knowledge check', 'Drop-out rate', 'Completion rate', 'Learner analytics', 'Data dashboard',
  'SCORM compliance', 'xAPI standard', 'Tin Can API', 'LTI integration', 'Content delivery network',
  'Cloud hosting', 'User experience', 'User interface', 'Accessibility WCAG', 'Screen reader compatibility',
  'Alt text', 'Closed captioning', 'Transcript generation', 'Localization', 'Translation memory',
  'Corporate training', 'Onboarding program', 'Skill gap analysis', 'Training needs assessment',
  'Professional development', 'Soft skills training', 'Compliance training', 'Leadership coaching',
  'Mentorship program', 'Peer-to-peer learning', 'Community of practice', 'Social learning',
  'Informal learning', 'Knowledge base', 'FAQ repository', 'Helpdesk support', 'Ticket system',
  'Technical troubleshooting', 'Browser compatibility', 'Cross-device testing', 'Responsive design',
  'Fluid grid', 'Breakpoint configuration', 'Vector graphics', 'Raster images', 'SVG animation',
  'CSS styling', 'JavaScript integration', 'DOM manipulation', 'API request', 'JSON data',
  'Database schema', 'User authentication', 'Role-based access control', 'Single sign-on',
  'Data privacy', 'GDPR compliance', 'Cyber security training', 'Phishing simulation',
  'Agile project management', 'Sprint planning', 'Kanban board', 'Stakeholder feedback',
  'Quality assurance', 'Pilot testing', 'Beta release', 'Post-training evaluation', 'Return on investment',

  // --- ES : Diseño Instruccional y Educación Digital ---
  'Diseño instruccional', 'Pedagogía digital', 'E-learning', 'Blended learning', 'Aula invertida',
  'Gamificación', 'Ludificación', 'Análisis de necesidades', 'Objetivos de aprendizaje', 'Mapa curricular',
  'Modelo ADDIE', 'Modelo SAM', 'Secuenciación didáctica', 'Materiales didácticos', 'Guía de aprendizaje',
  'Objeto virtual de aprendizaje', 'Repositorio de recursos', 'Plataforma educativa', 'Entorno virtual de aprendizaje',
  'Tutoría virtual', 'Acompañamiento docente', 'Evaluación formativa', 'Evaluación sumativa',
  'Retroalimentación', 'Rúbrica de evaluación', 'Autoevaluación', 'Coevaluación', 'Insignias digitales',
  'Portafolio digital', 'Microaprendizaje', 'Aprendizaje móvil', 'Aprendizaje social', 'Aprendizaje colaborativo',
  'Trabajo en equipo', 'Foro de discusión', 'Videoconferencia', 'Clase en vivo', 'Grabación de sesión',
  'Pizarra digital', 'Mapa conceptual', 'Infografía educativa', 'Podcast formativo', 'Video interactivo',
  'Simulador virtual', 'Caso de estudio', 'Juego de roles', 'Reto de aprendizaje', 'Indicador de logro',
  'Tasa de retención', 'Analíticas de aprendizaje', 'Accesibilidad web', 'Diseño universal para el aprendizaje',
  'Inclusión educativa', 'Diversidad en el aula', 'Competencias digitales', 'Alfabetización mediática',
  'Pensamiento crítico', 'Resolución de problemas', 'Creatividad e innovación', 'Comunicación efectiva',
  'Liderazgo educativo', 'Gestión del tiempo', 'Motivación intrínseca', 'Carga cognitiva',
  'Curaduría de contenidos', 'Actualización profesional', 'Formación continua', 'Capacitación corporativa',
  'Inducción de personal', 'Gestión del talento', 'Clima laboral', 'Cultura organizacional',
  'Transformación digital', 'Innovación pedagógica', 'Tendencias educativas', 'Inteligencia artificial educativa',
  'Asistente virtual', 'Automatización de procesos', 'Gestión de proyectos', 'Metodología ágil',
  'Control de calidad', 'Prueba piloto', 'Validación técnica', 'Mantenimiento de plataforma',
  'Soporte al usuario', 'Experiencia de usuario', 'Interfaz intuitiva', 'Navegación web',
  'Arquitectura de la información', 'Diseño responsivo', 'Compatibilidad móvil', 'Optimización de recursos',
  'Compresión de video', 'Estándar SCORM', 'Protocolo LTI', 'Seguridad informática', 'Privacidad de datos',
  'Marco de referencia', 'Certificación de calidad', 'Mejora continua'
];
const DUREE = 4.6;
const MARGE = 20; // px de respiration autour du contenu
// Tailles et transparences : plus un mot est grand, plus il est discret (jamais au-dessus de 0,26).
const TAILLES = [
  { px: 11, alpha: 0.26, mono: true, poids: 4 },
  { px: 13, alpha: 0.23, mono: true, poids: 4 },
  { px: 17, alpha: 0.18, mono: false, poids: 3 },
  { px: 24, alpha: 0.13, mono: false, poids: 2 },
  { px: 36, alpha: 0.09, mono: false, poids: 1 },
  { px: 52, alpha: 0.06, mono: false, poids: 1 },
];
const TIRAGE = TAILLES.flatMap((taille) => Array(taille.poids).fill(taille));
const UNIQUES = [...new Set(MOTS)];

const pioche = (liste) => liste[Math.floor(Math.random() * liste.length)];
const alea = (min, max) => min + Math.random() * (max - min);

export function monterMots(zone) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const petit = matchMedia('(width < 56rem)').matches;

  const canvas = document.createElement('canvas');
  canvas.className = 'fond-mots';
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

  // Couleurs du thème, relues quand il change.
  let encre = '#12355b';
  let emeraude = '#16766c';
  const lireCouleurs = () => {
    const style = getComputedStyle(document.documentElement);
    encre = style.getPropertyValue('--text-primary').trim() || encre;
    const sombre = document.documentElement.classList.contains('dark');
    emeraude = style.getPropertyValue(sombre ? '--color-secondary-400' : '--color-secondary-600').trim() || emeraude;
  };
  lireCouleurs();
  new MutationObserver(lireCouleurs).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const pops = [];
  let t = 0;
  let prochain = 0.6;

  const police = (taille) => (taille.mono
    ? `500 ${taille.px}px "Space Mono", monospace`
    : `600 ${taille.px}px "Cabinet Grotesk", system-ui, sans-serif`);

  // Un mot, une taille : ni cadre ni pastille, seulement du texte très léger.
  // Zones occupées par le contenu (portrait, phrases, accroche, domaines) et par le réseau : les mots n'y apparaissent jamais.
  const interdites = () => {
    const cadre = zone.getBoundingClientRect();
    return [...zone.querySelectorAll('.hero__portrait, .phrase, .hero__eyebrow, .hero__intro, .hero__domaines, .hero__orbites')]
      .map((element) => {
        const r = element.getBoundingClientRect();
        return { x: r.left - cadre.left - MARGE, y: r.top - cadre.top - MARGE, l: r.width + 2 * MARGE, h: r.height + 2 * MARGE };
      });
  };
  const chevauche = (a, b) => a.x < b.x + b.l && a.x + a.l > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const placer = () => {
    const taille = pioche(TIRAGE);
    const mot = taille.mono ? pioche(UNIQUES).toUpperCase() : pioche(UNIQUES);
    ctx.font = police(taille);
    const l = ctx.measureText(mot).width;
    const h = taille.px * 1.5;
    const zones = interdites();
    for (let essai = 0; essai < 40; essai += 1) {
      const x = alea(24, Math.max(25, largeur - l - 24));
      const y = alea(24, Math.max(25, hauteur - h - 40));
      const boite = { x, y, l, h };
      if (!zones.some((z) => chevauche(boite, z)) && pops.every((p) => !chevauche(boite, { x: p.x - 24, y: p.y - 12, l: p.l + 48, h: p.h + 24 }))) {
        const tirage = Math.random();
        return { x, y, l, h, mot, taille, age: 0, couleur: tirage < 0.45 ? 'emeraude' : 'encre' };
      }
    }
    return null;
  };

  const dessiner = (p) => {
    const age = p.age / DUREE;
    const entree = Math.min(1, p.age / 0.5);
    const sortie = age > 0.7 ? 1 - (age - 0.7) / 0.3 : 1;
    const alpha = Math.max(0, Math.min(entree, sortie)) * p.taille.alpha;
    // Petit rebond à l'apparition, puis le mot flotte lentement vers le haut en s'effaçant.
    const echelle = entree < 1 ? 0.85 + 0.15 * (1 + 2.2 * (entree - 1) ** 3 + 1.2 * (entree - 1) ** 2) : 1;
    ctx.save();
    ctx.translate(p.x + p.l / 2, p.y - age * p.taille.px * 0.6);
    ctx.scale(echelle, echelle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.couleur === 'emeraude' ? emeraude : encre;
    ctx.font = police(p.taille);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.mot, 0, 0);
    ctx.restore();
  };

  const pas = (_, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    t += dt;
    ctx.clearRect(0, 0, largeur, hauteur);
    if (t > prochain && pops.length < (petit ? 2 : 4)) {
      const pop = placer();
      if (pop) pops.push(pop);
      prochain = t + alea(1.4, 2.6);
    }
    for (let i = pops.length - 1; i >= 0; i -= 1) {
      pops[i].age += dt;
      if (pops[i].age >= DUREE) { pops.splice(i, 1); continue; }
      dessiner(pops[i]);
    }
    ctx.globalAlpha = 1;
  };

  let visible = true;
  const mettreAJour = () => {
    gsap.ticker.remove(pas);
    if (visible && !document.hidden && !enPause()) gsap.ticker.add(pas);
  };
  new IntersectionObserver(([entree]) => { visible = entree.isIntersecting; mettreAJour(); }).observe(zone);
  document.addEventListener('visibilitychange', mettreAJour);
  document.addEventListener('fond-pause', mettreAJour);
  mettreAJour();
}

import './theme.js';
import './navigation.js';
import './progress.js';
import './reveal.js';
import './pause.js';

for (const annee of document.querySelectorAll('[data-annee]')) {
  annee.textContent = new Date().getFullYear();
}

// Titres de page et libellés : effets typographiques GSAP, chargés à part et jamais avec « réduire les animations ».
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) import('./titres.js');

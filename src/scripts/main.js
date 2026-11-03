import './theme.js';
import './navigation.js';
import './progress.js';
import './reveal.js';

for (const annee of document.querySelectorAll('[data-annee]')) {
  annee.textContent = new Date().getFullYear();
}

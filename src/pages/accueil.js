import { getProfile } from '../services/contentRepository.js';
import { rendrePortrait } from '../components/portrait.js';

try {
  const profil = await getProfile();
  for (const cible of document.querySelectorAll('[data-rendu="portrait"]')) cible.innerHTML = rendrePortrait(profil);
} catch {
  for (const cible of document.querySelectorAll('[data-rendu]')) cible.innerHTML = '';
}

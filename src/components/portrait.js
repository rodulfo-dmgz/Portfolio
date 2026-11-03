import { echapperHtml } from '../scripts/utils.js';

/** Portrait du profil, ou un emplacement tant que la photographie n'est pas fournie. */
export function rendrePortrait(profil) {
  if (profil.portrait) {
    return `<img class="portrait__image" src="${echapperHtml(profil.portrait)}" alt="Portrait de ${echapperHtml(profil.nom)}" width="640" height="800" loading="lazy" decoding="async" />`;
  }
  const initiales = `${profil.prenom[0]}${profil.nomFamille[0]}`;
  return `<div class="portrait__vide"><span class="portrait__initiales" aria-hidden="true">${echapperHtml(initiales)}</span><span class="portrait__legende">Portrait à venir</span></div>`;
}

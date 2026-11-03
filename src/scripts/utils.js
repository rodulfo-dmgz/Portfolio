const entites = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** À utiliser pour toute valeur issue des données insérée dans du HTML. */
export const echapperHtml = (valeur) => String(valeur ?? '').replace(/[&<>"']/g, (c) => entites[c]);

/** Prépare une icône Iconoir importée en `?raw` pour l'insérer dans du HTML. */
export const icone = (svg) =>
  svg.replace(/<svg [^>]*>/, '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke-width="1.5" aria-hidden="true" focusable="false">');

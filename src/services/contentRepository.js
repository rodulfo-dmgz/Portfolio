/**
 * Point d'accès unique aux contenus éditoriaux.
 * Les pages n'importent jamais les fichiers JSON : elles passent par ces fonctions.
 * Pour passer à Supabase, il suffit de remplacer `charger` ; les signatures restent identiques.
 */
const sources = import.meta.glob('../data/*.json', { import: 'default' });

const cache = new Map();

async function charger(nom) {
  if (!cache.has(nom)) {
    const source = sources[`../data/${nom}.json`];
    if (!source) throw new Error(`Contenu introuvable : ${nom}`);
    cache.set(nom, source());
  }
  return cache.get(nom);
}

export const getProfile = () => charger('profile');

export async function getExpertises() {
  return (await charger('expertise')).domaines;
}

export async function getMethode() {
  return (await charger('expertise')).methode;
}

export async function getCategories() {
  return (await charger('projects')).categories;
}

export async function getProjects({ category, featured } = {}) {
  const { projets } = await charger('projects');
  return projets.filter((projet) =>
    (!category || projet.category === category) && (featured === undefined || projet.featured === featured));
}

/** Renvoie le projet, le précédent et le suivant, ou `null` si le slug n'existe pas. */
export async function getProjectBySlug(slug) {
  const { projets } = await charger('projects');
  const index = projets.findIndex((projet) => projet.slug === slug);
  if (index === -1) return null;
  return {
    projet: projets[index],
    precedent: projets[(index - 1 + projets.length) % projets.length],
    suivant: projets[(index + 1) % projets.length],
  };
}

export const getAPropos = () => charger('apropos');

import { getCategories, getProjects } from '../services/contentRepository.js';
import { monterFond } from '../scripts/fond-hero.js';
import { MOUVEMENT_REDUIT } from '../scripts/ecran.js';

const page = document.querySelector('main');
monterFond({ zone: page, pluie: page.querySelector('[data-pluie]'), orbites: page.querySelector('[data-orbites]'), reduit: MOUVEMENT_REDUIT.matches });

try {
  const [categories, projets] = await Promise.all([getCategories(), getProjects()]);
  const demandee = new URLSearchParams(location.search).get('categorie');
  const categorie = categories.find((autre) => autre.id === demandee) ?? null;
  const { monterBureau } = await import('../components/bureau.js');
  monterBureau(document.querySelector('[data-bureau]'), projets, categorie);
} catch {
  document.querySelector('[data-aide]').textContent = 'Impossible de charger les projets. Actualisez la page.';
}

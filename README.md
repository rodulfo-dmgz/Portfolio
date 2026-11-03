# Portfolio de Rodulfo Dominguez

Portfolio professionnel de Rodulfo Dominguez, concepteur et ingénieur pédagogique à Montpellier : ingénierie pédagogique, conception de parcours, formation professionnelle et digital learning.

Site multipage en HTML, CSS et JavaScript natifs, construit avec [Vite](https://vite.dev/). Aucun framework JavaScript ni CSS.

## Démarrer

```bash
npm install
npm run dev        # serveur de développement
npm run build      # build de production dans dist/
npm run preview    # prévisualiser le build
```

Node 20.19 ou plus récent est nécessaire.

## Structure

```text
index.html, a-propos.html, expertises.html,
realisations.html, projet.html, contact.html,
mentions-legales.html, 404.html      Pages (projet.html sert /realisations/:slug)
public/assets/                       Polices (woff2), images, icônes
src/
  components/                        En-tête, pied de page (HTML) et composants JS
  data/                              Contenus : profile, apropos, expertise, projects (JSON)
  pages/                             Un script par page qui affiche les données
  scripts/                           Thème, navigation, animations, progression
  services/                          contentRepository.js (accès aux contenus), contactService.js
  styles/                            tokens.css (design system), typographie, composants, pages
vite.config.js                       Composants HTML, icônes, URL propres
vite.seo.js                          Canonical, Open Graph, données structurées, sitemap, robots.txt
vercel.json                          URL propres, réécriture des études de cas, en-têtes
```

## Modifier les contenus

Tout le texte éditorial vit dans `src/data/` :

- `profile.json` : identité, accroche, contacts, faits, portrait (`portrait`) et CV (`cv`).
- `apropos.json` : parcours, approche, compétences, outils.
- `expertise.json` : domaines d'expertise et méthodologie.
- `projects.json` : catégories et réalisations. Ajouter un objet à `projets` suffit pour créer sa carte et sa page `/realisations/<slug>`.

Les pages passent par `src/services/contentRepository.js`. Pour brancher une base de données (Supabase), remplacer la fonction `charger` de ce fichier.

Un champ `null` ou vide n'est pas affiché : une réalisation sans année, sans contexte ou sans résultats reste présentable.

## Pages sur un seul écran

L'accueil, À propos, Expertises et Réalisations tiennent sur un seul écran, sans défilement, dès que la fenêtre fait au moins 64 rem de large et 40 rem de haut (`src/styles/ecran.css`, `src/scripts/ecran.js`). En dessous, ces pages se lisent en défilant, ce qui garde le texte lisible à 200 % de zoom et sur téléphone.

- **À propos :** la carte change d'étape avec les boutons, la molette, les flèches ou un balayage ; les autres sujets s'ouvrent en panneaux (`src/pages/a-propos.js`).
- **Fond commun :** pluie de lettres et réseau de points qui tourne (`src/scripts/fond-hero.js`), ondes émeraude très pâles à chaque arrêt de la souris (`src/scripts/ondes.js`), mots en « pop » (`src/scripts/mots-pop.js`), sur l'accueil seulement.

## Animations

Les animations avancées utilisent [GSAP](https://gsap.com/) (licence gratuite). Chaque module est chargé uniquement sur la page qui en a besoin et reste inactif avec « réduire les animations ».

| Page | Effets | Fichiers |
|---|---|---|
| Toutes | Titre de page lettre par lettre, libellés « scramble » | `src/scripts/titres.js` |
| Accueil | Portrait central, pluie de lettres, réseau de points type IA, phrases qui changent de langue (français, espagnol, anglais), profondeur au pointeur | `src/scripts/hero.js`, `src/scripts/fond-hero.js` |
| À propos | Carte épinglée : un avion vole du Chiapas à Montpellier, la caméra le suit | `src/components/voyage.js`, `src/data/carte.json` |
| Expertises | Volets qui s'ouvrent, bandeaux de mots cinétiques | `src/components/volets.js`, `src/components/defilement.js` |
| Réalisations | Ordinateur : raccourcis vers les projets en ligne et navigateur intégré | `src/components/bureau.js` |

**Photos à fournir :**
- Portrait : `portrait` dans `src/data/profile.json` (image 4:5, par exemple `/assets/images/portrait.webp`).
- Photos de chaque étape du voyage : `photos` (`{ "src", "alt" }`) de chaque chapitre dans `src/data/apropos.json`.
- Photos des passions : `photo` (`{ "src", "alt" }`) de chaque passion dans `apropos.json`.

En développement, des cadres « Photo à venir » marquent leur emplacement ; ils n'apparaissent pas en production.

**Ordinateur :** un raccourci est créé pour chaque réalisation dont `content.resources` contient une ressource de type `demo`. Les projets s'affichent dans un `iframe` : un site qui interdit l'affichage dans un cadre (`X-Frame-Options`) reste ouvrable avec « Ouvrir dans un nouvel onglet ».

**Carte :** `src/data/carte.json` contient les terres (Natural Earth, via `world-atlas`) et la position des trois villes, projetées en Mercator.

## Design system

Les variables CSS sont dans `src/styles/tokens.css` : couleurs, typographie (Cabinet Grotesk, Switzer, Space Mono), espacements, rayons, ombres. Le thème sombre repose sur la classe `dark` de `<html>` ; le choix (clair, sombre, système) est mémorisé dans `localStorage` sous `rd-theme`.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `SITE_URL` | Adresse publique (`https://exemple.fr`). Sans elle, le build utilise `VERCEL_PROJECT_PRODUCTION_URL` ; sans adresse, il omet `sitemap.xml`, les adresses canoniques et l'image Open Graph. |
| `VITE_CONTACT_ENDPOINT` | Adresse d'un service qui reçoit un `POST` JSON `{ nom, email, message }` (par exemple Formspree). Sans elle, le formulaire de contact reste masqué et la page renvoie vers l'email. |

Voir `.env.example`.

## Déploiement

Le site se déploie sur Vercel sans réglage particulier : commande `npm run build`, dossier de sortie `dist`. `vercel.json` gère les URL propres, la route `/realisations/:slug` et les en-têtes.

## Licences

Cabinet Grotesk et Switzer (Indian Type Foundry) sont sous licence Fontshare, Space Mono sous licence SIL OFL : les textes de licence sont dans `public/assets/fonts/licences/`. Les icônes viennent d'[Iconoir](https://iconoir.com/) (MIT).

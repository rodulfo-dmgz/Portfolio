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

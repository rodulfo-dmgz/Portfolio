# RD FORMATION – Site vitrine / CV dynamique de Rodulfo DOMINGUEZ

Ce projet est un site personnel présentant le parcours, les réalisations et la pédagogie de Rodulfo DOMINGUEZ, formateur et développeur.

## Architecture

- **HTML5** sémantique
- **CSS pur** avec `@layer` pour gérer la spécificité (reset, tokens, layout, components, modules)
- **JavaScript vanilla** pour les interactions (menu, animations, chargement projets)
- Option : connexion à **Supabase** pour les projets (exemple fourni)

## Installation

1. Clonez ce dépôt.
2. Ouvrez le dossier dans un éditeur de code.
3. Lancez un serveur local (par exemple avec Live Server de VS Code).
4. Visualisez le site dans votre navigateur.

## Personnalisation

- **Images** : placez vos propres images dans `assets/images/` (formats WebP recommandés).
- **Couleurs** : modifiez les variables dans `css/base/variables.css`.
- **Contenu** : adaptez les textes dans les fichiers HTML.

## Utilisation de Supabase (optionnel)

1. Créez un projet Supabase et une table `projects` avec les colonnes : `title`, `description`, `image`, `tags` (array), `link`.
2. Dans `js/creations.js`, décommentez la partie Supabase et créez un fichier `js/supabase-config.js` contenant votre URL et clé anon.
3. Appelez `loadProjectsFromSupabase()` au lieu de la version statique.

## Accessibilité

- Contrastes WCAG AA respectés (vérifiez avec vos images).
- Navigation clavier possible (menu, liens).
- Attributs `aria` pour le menu burger.

## Performances

- Images optimisées (chargez des WebP).
- CSS et JS minifiables pour la production (outil externe).

## Licence

Libre d'utilisation et de modification.
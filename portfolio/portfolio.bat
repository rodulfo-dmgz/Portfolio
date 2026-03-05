@echo off
echo Creation de l'arborescence du projet...

:: Création des fichiers racine
type nul > index.html
type nul > parcours.html
type nul > creations.html
type nul > a-propos.html
type nul > README.md

:: Création du dossier CSS et ses sous-dossiers
mkdir css\base
mkdir css\layout
mkdir css\components
mkdir css\modules

:: Fichiers CSS
type nul > css\main.css
type nul > css\base\reset.css
type nul > css\base\variables.css
type nul > css\base\typography.css
type nul > css\layout\grid.css
type nul > css\layout\navbar.css
type nul > css\layout\navigation.css
type nul > css\components\buttons.css
type nul > css\components\cards.css
type nul > css\components\forms.css
type nul > css\modules\parcours.css
type nul > css\modules\creations.css
type nul > css\modules\a-propos.css

:: Création du dossier JS et fichiers
mkdir js
type nul > js\main.js
type nul > js\parcours.js
type nul > js\creations.js

:: Création des dossiers Assets
mkdir assets\images
mkdir assets\icons

echo.
echo Structure creee avec succes !
pause
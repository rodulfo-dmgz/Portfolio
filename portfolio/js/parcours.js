/**
 * parcours.js - Globe interactif du parcours
 * Version avec drapeaux SVG (flag-icons)
 */

/* Données des pays du parcours */
const countriesData = [
    {
        id: 'mexico',
        name: 'Mexique',
        city: 'Tapachula',
        coordinate: { x: 16, y: 49 },   // Ajustez selon votre projection SVG
        color: '#006847'
    },
    {
        id: 'guinea',
        name: 'Guinée Équatoriale',
        city: 'Malabo',
        coordinate: { x: 51, y: 58 },
        color: '#009639'
    },
    {
        id: 'france',
        name: 'France',
        city: 'Montpellier',
        coordinate: { x: 47, y: 29 },
        color: '#002395'
    }
];

// Mapping ID pays -> code ISO (pour flag-icons)
const countryCodeMap = {
    mexico: 'mx',
    guinea: 'gq',
    france: 'fr'
};

/* Variables globales */
const interactiveGlobe = document.getElementById('interactiveGlobe');

/* Initialisation au chargement de la page */
document.addEventListener('DOMContentLoaded', () => {
    initGlobe();
    initModalHandlers();
});

/**
 * Initialiser le globe avec les marqueurs
 */
function initGlobe() {
    if (!interactiveGlobe) return;

    countriesData.forEach(country => {
        const marker = document.createElement('div');
        marker.className = 'country-marker';
        marker.dataset.countryId = country.id;
        marker.dataset.countryName = country.name;
        marker.style.left = `${country.coordinate.x}%`;
        marker.style.top = `${country.coordinate.y}%`;

        // Récupération du code ISO pour le drapeau
        const isoCode = countryCodeMap[country.id] || 'xx';

        // Création du tooltip (affiché au survol) avec le drapeau SVG
        const tooltip = document.createElement('span');
        tooltip.className = 'country-tooltip';
        tooltip.innerHTML = `<span class="fi fi-${isoCode}"></span> ${country.city}`;
        marker.appendChild(tooltip);

        /* Gestionnaire de clic - ouvrir le modal */
        marker.addEventListener('click', () => {
            // Retirer la classe active de tous les marqueurs
            document.querySelectorAll('.country-marker').forEach(m => {
                m.classList.remove('active');
            });
            // Ajouter la classe active au marqueur cliqué
            marker.classList.add('active');
            // Ouvrir le modal correspondant
            openCountryModal(country.id);
        });

        // Amélioration du z-index au survol
        marker.addEventListener('mouseenter', () => {
            if (!marker.classList.contains('active')) {
                marker.style.zIndex = '30';
            }
        });
        marker.addEventListener('mouseleave', () => {
            if (!marker.classList.contains('active')) {
                marker.style.zIndex = '20';
            }
        });

        interactiveGlobe.appendChild(marker);
    });
}

/**
 * Ouvrir le modal d'un pays
 */
function openCountryModal(countryId) {
    const modal = document.getElementById(`modal-${countryId}`);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Mettre à jour les icônes Lucide dans le modal
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }
}

/**
 * Fermer le modal d'un pays
 */
function closeCountryModal(countryId) {
    const modal = document.getElementById(`modal-${countryId}`);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Retirer la classe active du marqueur correspondant
        const marker = document.querySelector(`[data-country-id="${countryId}"]`);
        if (marker) {
            marker.classList.remove('active');
            // Réinitialiser le z-index
            marker.style.zIndex = '20';
        }
    }
}

/**
 * Initialiser les gestionnaires de fermeture des modals
 */
function initModalHandlers() {
    // Fermeture en cliquant sur l'arrière-plan
    document.querySelectorAll('.country-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                const countryId = modal.id.replace('modal-', '');
                closeCountryModal(countryId);
            }
        });
    });

    // Fermeture avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.country-modal.active').forEach(modal => {
                const countryId = modal.id.replace('modal-', '');
                closeCountryModal(countryId);
            });
        }
    });
}



// Exposer la fonction globalement pour les attributs onclick
window.closeCountryModal = closeCountryModal;
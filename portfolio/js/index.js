// index.js - Script pour la page d'accueil

// Projets à afficher
const projects = [
    {
        title: "Plateforme d'apprentissage interactive",
        description: "Outil de formation avec quiz, suivi en temps réel et tableaux de bord pour formateurs. Interface intuitive pour une expérience d'apprentissage optimale.",
        image: "assets/images/project1.jpg",
        tags: ["React", "Node.js", "MongoDB", "Socket.io"],
        link: "https://github.com/rodulfo"
    },
    {
        title: "Portfolio générateur intelligent",
        description: "Application web permettant aux développeurs de générer automatiquement leur portfolio professionnel avec personnalisation avancée.",
        image: "assets/images/project2.jpg",
        tags: ["Vue.js", "CSS Grid", "API REST", "Firebase"],
        link: "https://github.com/rodulfo"
    },
    {
        title: "Outil collaboratif pédagogique",
        description: "Application de gestion de tâches et projets spécialement conçue pour les équipes pédagogiques et les environnements d'apprentissage.",
        image: "assets/images/project3.jpg",
        tags: ["Svelte", "Supabase", "Tailwind", "PWA"],
        link: "https://github.com/rodulfo"
    },
    {
        title: "Système de gestion LMS",
        description: "Learning Management System complet avec suivi des apprenants, création de parcours et analytics avancés.",
        image: "assets/images/project4.jpg",
        tags: ["Next.js", "PostgreSQL", "TypeScript", "Chart.js"],
        link: "https://github.com/rodulfo"
    },
    {
        title: "Application mobile d'apprentissage",
        description: "App mobile cross-platform pour l'apprentissage des langues avec gamification et reconnaissance vocale.",
        image: "assets/images/project5.jpg",
        tags: ["React Native", "Expo", "TensorFlow", "Redux"],
        link: "https://github.com/rodulfo"
    },
    {
        title: "Dashboard analytique formation",
        description: "Tableau de bord interactif pour visualiser les métriques de formation et suivre la progression des apprenants.",
        image: "assets/images/project6.jpg",
        tags: ["D3.js", "Python", "Flask", "Pandas"],
        link: "https://github.com/rodulfo"
    }
];

// Fonction pour afficher les projets
function displayProjects(projectsArray) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = projectsArray.map((proj, index) => `
        <div class="card project-card" style="animation-delay: ${index * 0.1}s;">
            <div class="card-image" style="background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));">
                <div style="height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">
                    <i data-lucide="${getProjectIcon(proj.tags[0])}"></i>
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${proj.title}</h3>
                <p>${proj.description}</p>
                <div class="card-tags">
                    ${proj.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                </div>
                <div class="card-footer">
                    <a href="${proj.link}" class="btn btn-secondary btn-sm" target="_blank" rel="noopener">
                        <i data-lucide="external-link"></i>
                        Voir le projet
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    // Réinitialiser les icônes Lucide
    lucide.createIcons();
}

// Fonction helper pour obtenir une icône appropriée selon la techno
function getProjectIcon(tech) {
    const icons = {
        'React': 'component',
        'Vue.js': 'layers',
        'Svelte': 'sparkles',
        'Next.js': 'zap',
        'Python': 'cpu',
        'D3.js': 'bar-chart-3'
    };
    return icons[tech] || 'code-2';
}

// Smooth scroll pour les liens d'ancrage
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' etet href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Animation des barres de progression des compétences
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.style.width;
                bar.style.width = '0%';
                
                setTimeout(() => {
                    bar.style.transition = 'width 1.5s ease-out';
                    bar.style.width = targetWidth;
                }, 100);
                
                observer.unobserve(bar);
            }
        });
    }, {
        threshold: 0.5
    });
    
    skillBars.forEach(bar => observer.observe(bar));
}

// Animation des cartes au scroll
function animateCardsOnScroll() {
    const cards = document.querySelectorAll('.journey-card, .about-personal .card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    cards.forEach(card => observer.observe(card));
}

// Compteur animé pour les stats (optionnel)
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Afficher les projets
    displayProjects(projects);
    
    // Initialiser les icônes Lucide
    lucide.createIcons();
    
    // Lancer les animations
    animateSkillBars();
    animateCardsOnScroll();
    
    // Ajouter un effet de parallaxe subtil au hero
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const hero = document.querySelector('.hero');
                if (hero etet scrolled < window.innerHeight) {
                    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
});
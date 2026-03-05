const projects = [
    {
        title: "Plateforme interactive d'apprentissage",
        description: "Outil de formation avec quiz et suivi en temps réel.",
        image: "assets/images/project1.jpg",
        tags: ["React", "Node.js", "MongoDB"],
        link: "https://github.com/..."
    },
    {
        title: "Portfolio générateur",
        description: "Générateur de portfolio pour développeurs.",
        image: "assets/images/project2.jpg",
        tags: ["Vue.js", "CSS Grid", "API"],
        link: "https://github.com/..."
    },
    {
        title: "Application de gestion de tâches",
        description: "Outil collaboratif pour les équipes pédagogiques.",
        image: "assets/images/project3.jpg",
        tags: ["Svelte", "Supabase", "Tailwind"],
        link: "https://github.com/..."
    }
];

function displayProjects(projectsArray) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = projectsArray.map(proj => `
        <div class="card">
            <img src="${proj.image}" alt="${proj.title}" class="card-image" loading="lazy">
            <div class="card-content">
                <h3 class="card-title">${proj.title}</h3>
                <p>${proj.description}</p>
                <div class="card-tags">
                    ${proj.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                </div>
                <a href="${proj.link}" class="btn btn-secondary" target="_blank" rel="noopener">Voir le projet</a>
            </div>
        </div>
    `).join('');
}

displayProjects(projects);
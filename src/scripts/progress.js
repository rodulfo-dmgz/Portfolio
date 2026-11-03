/** Indicateur de progression de lecture : une fine barre sous l'en-tête. */
const barre = document.querySelector('.progression span');

if (barre) {
  let enAttente = false;

  const mettreAJour = () => {
    enAttente = false;
    const total = document.documentElement.scrollHeight - innerHeight;
    const part = total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0;
    barre.style.transform = `scaleX(${part})`;
  };

  const planifier = () => {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(mettreAJour);
  };

  addEventListener('scroll', planifier, { passive: true });
  new ResizeObserver(planifier).observe(document.body);
  mettreAJour();
}

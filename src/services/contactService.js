/**
 * Envoi du formulaire de contact.
 * Aucun envoi n'est simulé : sans point d'accès configuré, le service le dit.
 * Pour activer l'envoi, définir VITE_CONTACT_ENDPOINT (service compatible avec un POST JSON, par exemple Formspree).
 */
const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;

export const envoiDisponible = () => Boolean(endpoint);

/** @returns {Promise<{ok: true} | {ok: false, raison: 'non-configure' | 'refuse' | 'reseau'}>} */
export async function envoyerMessage({ nom, email, message }) {
  if (!endpoint) return { ok: false, raison: 'non-configure' };
  try {
    const reponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ nom, email, message }),
    });
    return reponse.ok ? { ok: true } : { ok: false, raison: 'refuse' };
  } catch {
    return { ok: false, raison: 'reseau' };
  }
}

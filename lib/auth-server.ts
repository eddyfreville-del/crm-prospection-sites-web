import "server-only";

/**
 * Vérifie qu'une requête porte un jeton Netlify Identity valide, en le
 * validant réellement auprès du service Identity (pas de simple décodage de
 * JWT côté client) : on appelle /.netlify/identity/user avec ce jeton en
 * Bearer. Netlify ne le renvoie 200 que si le jeton est valide et non expiré.
 *
 * `process.env.URL` est fourni automatiquement par Netlify à l'exécution
 * (l'URL de production du site) — inutile de la configurer à la main.
 */
export async function verifyRequest(req: Request): Promise<{ email: string } | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL;
  if (!siteUrl) {
    console.error("Aucune URL de site disponible pour vérifier l'identité (process.env.URL).");
    return null;
  }

  try {
    const res = await fetch(`${siteUrl}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = await res.json();
    return { email: user.email as string };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json({ error: "Non authentifié." }, { status: 401 });
}

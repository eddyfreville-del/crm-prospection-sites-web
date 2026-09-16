import { verifyRequest, unauthorized } from "@/lib/auth-server";
import { createProspectionDatabase } from "@/lib/notionClient";

export const dynamic = "force-dynamic";

/**
 * Endpoint à usage unique : crée la base Notion "CRM — Prospection Sites Web"
 * sous la page indiquée, avec toutes les colonnes attendues par l'app.
 *
 * À appeler une seule fois après le premier déploiement (voir README), avec
 * NOTION_TOKEN déjà configuré dans les variables d'environnement Netlify.
 * Se bloque volontairement si NOTION_DATABASE_ID est déjà défini, pour éviter
 * de recréer une base par erreur.
 */
export async function POST(req: Request) {
  const user = await verifyRequest(req);
  if (!user) return unauthorized();

  if (process.env.NOTION_DATABASE_ID) {
    return Response.json(
      {
        error:
          "NOTION_DATABASE_ID est déjà configuré — la base a probablement déjà été créée. Supprime cette variable si tu veux vraiment en recréer une.",
      },
      { status: 409 }
    );
  }

  let parentPageId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    parentPageId = body.parentPageId || process.env.NOTION_PARENT_PAGE_ID;
  } catch {
    parentPageId = process.env.NOTION_PARENT_PAGE_ID;
  }

  if (!parentPageId) {
    return Response.json(
      { error: "Indique parentPageId dans le corps de la requête (ID de la page Notion parente)." },
      { status: 400 }
    );
  }

  try {
    const { databaseId, dataSourceId } = await createProspectionDatabase(parentPageId);
    return Response.json({
      message:
        "Base créée. Ajoute ces deux valeurs dans les variables d'environnement Netlify puis redéploie.",
      NOTION_DATABASE_ID: databaseId,
      NOTION_DATA_SOURCE_ID: dataSourceId,
    });
  } catch (err: any) {
    console.error("POST /api/admin/setup-notion —", err);
    return Response.json(
      { error: err?.message || "Erreur lors de la création de la base Notion." },
      { status: err?.status || 502 }
    );
  }
}

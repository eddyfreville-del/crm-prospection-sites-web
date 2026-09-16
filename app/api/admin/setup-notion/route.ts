import { verifyRequest, unauthorized } from "@/lib/auth-server";
import { createProspectionDatabase, repairProspectionDatabaseSchema } from "@/lib/notionClient";

export const dynamic = "force-dynamic";

/**
 * Endpoint à usage unique : crée la base Notion "CRM — Prospection Sites Web"
 * sous la page indiquée, avec toutes les colonnes attendues par l'app.
 *
 * Si NOTION_DATABASE_ID et NOTION_DATA_SOURCE_ID sont déjà configurés, répare
 * plutôt le schéma de la base existante (ajoute les colonnes manquantes) au
 * lieu d'en recréer une — sûr à appeler plusieurs fois.
 */
export async function POST(req: Request) {
  const user = await verifyRequest(req);
  if (!user) return unauthorized();

  const existingDataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (existingDataSourceId) {
    try {
      await repairProspectionDatabaseSchema(existingDataSourceId);
      return Response.json({
        message:
          "Schéma de colonnes vérifié et réparé sur la base existante. Aucune valeur à changer dans Netlify — retourne simplement sur le Dashboard.",
        repaired: true,
      });
    } catch (err: any) {
      console.error("POST /api/admin/setup-notion (repair) —", err);
      return Response.json(
        { error: err?.message || "Erreur lors de la réparation du schéma Notion." },
        { status: err?.status || 502 }
      );
    }
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

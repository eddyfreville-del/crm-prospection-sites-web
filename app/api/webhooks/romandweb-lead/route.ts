import { createNotionPage } from "@/lib/notionClient";
import { pageToProspect, prospectToProperties } from "@/lib/notionMapping";
import type { Canal, ProspectInput } from "@/lib/types";
import { CANAUX } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Webhook public (pas de session Netlify Identity ici — l'appelant est
 * Netlify Forms, pas un humain connecté) qui reçoit chaque soumission du
 * formulaire de contact du site Romand Web et crée automatiquement une
 * fiche dans ce CRM.
 *
 * Protégé par un jeton partagé simple passé en paramètre d'URL
 * (?token=...), vérifié contre LEAD_WEBHOOK_SECRET. Ce n'est pas une
 * authentification forte, mais le pire qu'un jeton deviné permette est la
 * création de fiches "prospect" indésirables — jamais de lecture ni
 * d'accès au reste du CRM.
 *
 * À configurer dans Netlify (site Romand Web) → Forms → contact →
 * Submission notifications → Add notification → HTTP POST request, avec
 * l'URL : https://<ce-site>.netlify.app/api/webhooks/romandweb-lead?token=...
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.LEAD_WEBHOOK_SECRET;

  if (!expected) {
    console.error("LEAD_WEBHOOK_SECRET n'est pas configuré.");
    return Response.json({ error: "Webhook non configuré." }, { status: 500 });
  }
  if (token !== expected) {
    return Response.json({ error: "Jeton invalide." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  // Netlify enveloppe les données du formulaire différemment selon le
  // contexte ; on tente les deux formes documentées pour rester robuste.
  const data = body?.payload?.data || body?.data || body || {};
  const nom = String(data.nom || "").trim();
  const besoin = String(data.besoin || "").trim();
  const moyenRaw = String(data.moyen || "").trim();

  if (!nom) {
    return Response.json({ error: "Champ 'nom' manquant dans la soumission." }, { status: 400 });
  }

  const canal = (CANAUX as readonly string[]).includes(moyenRaw) ? (moyenRaw as Canal) : null;

  const input: Partial<ProspectInput> = {
    entreprise: nom,
    statut: "À contacter",
    contact: nom,
    canal,
    priorite: "Haute",
    datePremierContact: new Date().toISOString().slice(0, 10),
    notes: `Lead entrant depuis le formulaire de contact du site Romand Web.${
      besoin ? `\n\nBesoin exprimé : ${besoin}` : ""
    }`,
  };

  try {
    const properties = prospectToProperties(input);
    const page = await createNotionPage(properties);
    return Response.json({ prospect: pageToProspect(page) }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/webhooks/romandweb-lead —", err);
    return Response.json(
      { error: err?.message || "Erreur lors de la création dans Notion." },
      { status: err?.status || 502 }
    );
  }
}

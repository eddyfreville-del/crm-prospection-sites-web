import { verifyRequest, unauthorized } from "@/lib/auth-server";
import { queryAllPages, createNotionPage } from "@/lib/notionClient";
import { pageToProspect, prospectToProperties } from "@/lib/notionMapping";
import type { ProspectInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await verifyRequest(req);
  if (!user) return unauthorized();

  try {
    const pages = await queryAllPages();
    const prospects = pages.map(pageToProspect);
    return Response.json({ prospects });
  } catch (err: any) {
    console.error("GET /api/prospects —", err);
    return Response.json(
      { error: err?.message || "Erreur lors de la lecture de Notion." },
      { status: err?.status || 502 }
    );
  }
}

export async function POST(req: Request) {
  const user = await verifyRequest(req);
  if (!user) return unauthorized();

  let input: Partial<ProspectInput>;
  try {
    input = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  if (!input.entreprise || !input.entreprise.trim()) {
    return Response.json({ error: "Le nom de l'entreprise est requis." }, { status: 400 });
  }

  try {
    const properties = prospectToProperties({ statut: "À contacter", ...input });
    const page = await createNotionPage(properties);
    return Response.json({ prospect: pageToProspect(page) }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/prospects —", err);
    return Response.json(
      { error: err?.message || "Erreur lors de la création dans Notion." },
      { status: err?.status || 502 }
    );
  }
}

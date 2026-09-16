import { verifyRequest, unauthorized } from "@/lib/auth-server";
import { retrieveNotionPage, updateNotionPage } from "@/lib/notionClient";
import { pageToProspect, prospectToProperties } from "@/lib/notionMapping";
import type { ProspectInput } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  const user = await verifyRequest(req);
  if (!user) return unauthorized();
  const { id } = await params;

  try {
    const page = await retrieveNotionPage(id);
    return Response.json({ prospect: pageToProspect(page) });
  } catch (err: any) {
    console.error(`GET /api/prospects/${id} —`, err);
    return Response.json(
      { error: err?.message || "Prospect introuvable." },
      { status: err?.status || 404 }
    );
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const user = await verifyRequest(req);
  if (!user) return unauthorized();
  const { id } = await params;

  let input: Partial<ProspectInput>;
  try {
    input = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  try {
    const properties = prospectToProperties(input);
    const page = await updateNotionPage(id, properties);
    return Response.json({ prospect: pageToProspect(page) });
  } catch (err: any) {
    console.error(`PATCH /api/prospects/${id} —`, err);
    return Response.json(
      { error: err?.message || "Erreur lors de la mise à jour dans Notion." },
      { status: err?.status || 502 }
    );
  }
}

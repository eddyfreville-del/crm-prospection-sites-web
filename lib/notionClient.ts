import "server-only";

/**
 * Client Notion minimal, en fetch brut plutôt que via le SDK officiel.
 *
 * Depuis la version d'API 2025-09-03, une base Notion peut contenir plusieurs
 * "data sources" : on ne requête plus /databases/{id}/query mais
 * /data_sources/{id}/query. On utilise directement l'API REST pour contrôler
 * précisément cette version, sans dépendre du support SDK.
 */
const NOTION_VERSION = "2025-09-03";
const NOTION_API = "https://api.notion.com/v1";

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`);
  return v;
}

async function notionFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token = must("NOTION_TOKEN");
  const res = await fetch(`${NOTION_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.message || `Erreur Notion ${res.status}`;
    const err = new Error(message) as Error & { status?: number; notionCode?: string };
    err.status = res.status;
    err.notionCode = body?.code;
    throw err;
  }
  return body as T;
}

/* -------------------------------------------------------------------------- */
/*  Création de la base (setup, une seule fois)                               */
/* -------------------------------------------------------------------------- */

const SELECT = (name: string, color: string) => ({ name, color });

/** Schéma des colonnes, partagé entre la création et la réparation d'une base existante. */
function prospectSchemaProperties(): Record<string, any> {
  return {
    Entreprise: { title: {} },
    Statut: {
      select: {
        options: [
          SELECT("À contacter", "gray"),
          SELECT("Contacté", "blue"),
          SELECT("Réponse reçue", "purple"),
          SELECT("Intéressé", "pink"),
          SELECT("Maquette", "yellow"),
          SELECT("Proposition envoyée", "orange"),
          SELECT("Relance", "red"),
          SELECT("Gagné", "green"),
          SELECT("Perdu", "default"),
        ],
      },
    },
    Contact: { rich_text: {} },
    Email: { email: {} },
    "Téléphone": { phone_number: {} },
    "Site actuel": { url: {} },
    "Ville / Canton": { rich_text: {} },
    Niche: {
      select: {
        options: [
          SELECT("Garage", "blue"),
          SELECT("Immobilier", "green"),
          SELECT("Chauffeur privé", "purple"),
          SELECT("Autre", "gray"),
        ],
      },
    },
    Canal: {
      select: {
        options: [
          SELECT("Email", "blue"),
          SELECT("Instagram", "pink"),
          SELECT("LinkedIn", "purple"),
          SELECT("Téléphone", "green"),
          SELECT("WhatsApp", "green"),
        ],
      },
    },
    "Priorité": {
      select: {
        options: [SELECT("Haute", "red"), SELECT("Moyenne", "yellow"), SELECT("Basse", "gray")],
      },
    },
    "Date premier contact": { date: {} },
    "Dernier contact": { date: {} },
    "Prochaine relance": { date: {} },
    "Prix proposé CHF": { number: { format: "franc" } },
    Maquette: { url: {} },
    Notes: { rich_text: {} },
  };
}

export async function createProspectionDatabase(parentPageId: string) {
  const properties = prospectSchemaProperties();

  const database = await notionFetch<any>("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: "CRM — Prospection Sites Web" } }],
      // Depuis la version d'API 2025-09-03, le schéma de colonnes se déclare
      // sur la source de données initiale, pas au niveau racine — un
      // "properties" à plat ici est silencieusement ignoré et la base se
      // retrouve avec la seule colonne "Name" par défaut.
      initial_data_source: { properties },
    }),
  });

  const dataSourceId = database.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error(
      "La base a été créée mais aucune source de données n'a été retournée par l'API Notion."
    );
  }

  return { databaseId: database.id as string, dataSourceId: dataSourceId as string };
}

/**
 * Répare une base déjà créée dont le schéma de colonnes n'a pas été
 * appliqué correctement (voir le correctif ci-dessus sur
 * `initial_data_source`) : ajoute les colonnes manquantes sur la source de
 * données existante, sans rien recréer. Sûr à exécuter plusieurs fois.
 */
export async function repairProspectionDatabaseSchema(dataSourceId: string) {
  const properties = prospectSchemaProperties();
  await notionFetch<any>(`/data_sources/${dataSourceId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

/* -------------------------------------------------------------------------- */
/*  Lecture / écriture des prospects                                          */
/* -------------------------------------------------------------------------- */

export async function queryAllPages(dataSourceId?: string) {
  const dsId = dataSourceId || must("NOTION_DATA_SOURCE_ID");
  const pages: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await notionFetch<any>(`/data_sources/${dsId}/query`, {
      method: "POST",
      body: JSON.stringify({
        start_cursor: cursor,
        page_size: 100,
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
      }),
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

export async function createNotionPage(properties: Record<string, any>) {
  const dataSourceId = must("NOTION_DATA_SOURCE_ID");
  return notionFetch<any>("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties,
    }),
  });
}

export async function updateNotionPage(pageId: string, properties: Record<string, any>) {
  return notionFetch<any>(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

export async function retrieveNotionPage(pageId: string) {
  return notionFetch<any>(`/pages/${pageId}`, { method: "GET" });
}

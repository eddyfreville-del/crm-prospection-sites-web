import type { Prospect, ProspectInput } from "./types";

/** Lit un champ Notion vers une valeur JS simple, en tolérant les champs absents. */
function title(props: any, key: string): string {
  return props?.[key]?.title?.[0]?.plain_text ?? "";
}
function richText(props: any, key: string): string {
  return props?.[key]?.rich_text?.[0]?.plain_text ?? "";
}
function select(props: any, key: string): string | null {
  return props?.[key]?.select?.name ?? null;
}
function email(props: any, key: string): string {
  return props?.[key]?.email ?? "";
}
function phone(props: any, key: string): string {
  return props?.[key]?.phone_number ?? "";
}
function url(props: any, key: string): string {
  return props?.[key]?.url ?? "";
}
function date(props: any, key: string): string | null {
  return props?.[key]?.date?.start ?? null;
}
function num(props: any, key: string): number | null {
  return props?.[key]?.number ?? null;
}

/** Convertit une page Notion brute (résultat de l'API) en Prospect utilisable par l'app. */
export function pageToProspect(page: any): Prospect {
  const p = page.properties || {};
  return {
    id: page.id,
    entreprise: title(p, "Entreprise"),
    statut: (select(p, "Statut") as Prospect["statut"]) || "À contacter",
    contact: richText(p, "Contact"),
    email: email(p, "Email"),
    telephone: phone(p, "Téléphone"),
    siteActuel: url(p, "Site actuel"),
    villeCanton: richText(p, "Ville / Canton"),
    niche: select(p, "Niche") as Prospect["niche"],
    canal: select(p, "Canal") as Prospect["canal"],
    priorite: select(p, "Priorité") as Prospect["priorite"],
    datePremierContact: date(p, "Date premier contact"),
    dernierContact: date(p, "Dernier contact"),
    prochaineRelance: date(p, "Prochaine relance"),
    prixPropose: num(p, "Prix proposé CHF"),
    maquette: url(p, "Maquette"),
    notes: richText(p, "Notes"),
    lastEditedTime: page.last_edited_time,
  };
}

/**
 * Convertit un objet Prospect (ou un sous-ensemble de champs) vers le format
 * de propriétés Notion attendu par l'API pages.create / pages.update.
 * N'inclut que les clés réellement présentes dans `input`, pour permettre les
 * mises à jour partielles (ex: juste le statut lors d'un drag & drop).
 */
export function prospectToProperties(input: Partial<ProspectInput>): Record<string, any> {
  const props: Record<string, any> = {};

  if (input.entreprise !== undefined) {
    props["Entreprise"] = { title: [{ text: { content: input.entreprise } }] };
  }
  if (input.statut !== undefined) {
    props["Statut"] = { select: input.statut ? { name: input.statut } : null };
  }
  if (input.contact !== undefined) {
    props["Contact"] = { rich_text: [{ text: { content: input.contact } }] };
  }
  if (input.email !== undefined) {
    props["Email"] = { email: input.email || null };
  }
  if (input.telephone !== undefined) {
    props["Téléphone"] = { phone_number: input.telephone || null };
  }
  if (input.siteActuel !== undefined) {
    props["Site actuel"] = { url: input.siteActuel || null };
  }
  if (input.villeCanton !== undefined) {
    props["Ville / Canton"] = { rich_text: [{ text: { content: input.villeCanton } }] };
  }
  if (input.niche !== undefined) {
    props["Niche"] = { select: input.niche ? { name: input.niche } : null };
  }
  if (input.canal !== undefined) {
    props["Canal"] = { select: input.canal ? { name: input.canal } : null };
  }
  if (input.priorite !== undefined) {
    props["Priorité"] = { select: input.priorite ? { name: input.priorite } : null };
  }
  if (input.datePremierContact !== undefined) {
    props["Date premier contact"] = {
      date: input.datePremierContact ? { start: input.datePremierContact } : null,
    };
  }
  if (input.dernierContact !== undefined) {
    props["Dernier contact"] = {
      date: input.dernierContact ? { start: input.dernierContact } : null,
    };
  }
  if (input.prochaineRelance !== undefined) {
    props["Prochaine relance"] = {
      date: input.prochaineRelance ? { start: input.prochaineRelance } : null,
    };
  }
  if (input.prixPropose !== undefined) {
    props["Prix proposé CHF"] = { number: input.prixPropose };
  }
  if (input.maquette !== undefined) {
    props["Maquette"] = { url: input.maquette || null };
  }
  if (input.notes !== undefined) {
    props["Notes"] = { rich_text: [{ text: { content: input.notes } }] };
  }

  return props;
}

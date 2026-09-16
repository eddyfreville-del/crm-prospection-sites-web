export const STATUTS = [
  "À contacter",
  "Contacté",
  "Réponse reçue",
  "Intéressé",
  "Maquette",
  "Proposition envoyée",
  "Relance",
  "Gagné",
  "Perdu",
] as const;
export type Statut = (typeof STATUTS)[number];

export const NICHES = ["Garage", "Immobilier", "Chauffeur privé", "Autre"] as const;
export type Niche = (typeof NICHES)[number];

export const CANAUX = ["Email", "Instagram", "LinkedIn", "Téléphone"] as const;
export type Canal = (typeof CANAUX)[number];

export const PRIORITES = ["Haute", "Moyenne", "Basse"] as const;
export type Priorite = (typeof PRIORITES)[number];

export interface Prospect {
  id: string;
  entreprise: string;
  statut: Statut;
  contact: string;
  email: string;
  telephone: string;
  siteActuel: string;
  villeCanton: string;
  niche: Niche | null;
  canal: Canal | null;
  priorite: Priorite | null;
  datePremierContact: string | null;
  dernierContact: string | null;
  prochaineRelance: string | null;
  prixPropose: number | null;
  maquette: string;
  notes: string;
  /** Horodatage Notion de dernière modification, utile pour trier/déboguer. */
  lastEditedTime: string;
}

export type ProspectInput = Omit<Prospect, "id" | "lastEditedTime">;

export interface DashboardStats {
  contactes: number;
  reponses: number;
  interesses: number;
  maquettesRealisees: number;
  propositionsEnvoyees: number;
  clientsGagnes: number;
  chiffreAffaires: number;
  contactesAujourdhui: number;
  prochainesRelances: Prospect[];
}

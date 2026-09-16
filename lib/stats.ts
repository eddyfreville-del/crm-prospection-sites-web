import type { Prospect, DashboardStats } from "./types";

const AFTER_REPONSE = ["Réponse reçue", "Intéressé", "Maquette", "Proposition envoyée", "Relance", "Gagné"];
const AFTER_INTERESSE = ["Intéressé", "Maquette", "Proposition envoyée", "Relance", "Gagné"];
const AFTER_MAQUETTE = ["Maquette", "Proposition envoyée", "Relance", "Gagné"];
const AFTER_PROPOSITION = ["Proposition envoyée", "Relance", "Gagné"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function computeStats(prospects: Prospect[]): DashboardStats {
  const today = todayISO();

  const contactes = prospects.filter((p) => p.statut !== "À contacter").length;
  const reponses = prospects.filter((p) => AFTER_REPONSE.includes(p.statut)).length;
  const interesses = prospects.filter((p) => AFTER_INTERESSE.includes(p.statut)).length;
  const maquettesRealisees = prospects.filter((p) => AFTER_MAQUETTE.includes(p.statut)).length;
  const propositionsEnvoyees = prospects.filter((p) => AFTER_PROPOSITION.includes(p.statut)).length;
  const gagnes = prospects.filter((p) => p.statut === "Gagné");
  const clientsGagnes = gagnes.length;
  const chiffreAffaires = gagnes.reduce((sum, p) => sum + (p.prixPropose || 0), 0);

  const contactesAujourdhui = prospects.filter(
    (p) => p.dernierContact === today || p.datePremierContact === today
  ).length;

  const prochainesRelances = prospects
    .filter((p) => !!p.prochaineRelance)
    .sort((a, b) => (a.prochaineRelance! < b.prochaineRelance! ? -1 : 1))
    .slice(0, 8);

  return {
    contactes,
    reponses,
    interesses,
    maquettesRealisees,
    propositionsEnvoyees,
    clientsGagnes,
    chiffreAffaires,
    contactesAujourdhui,
    prochainesRelances,
  };
}

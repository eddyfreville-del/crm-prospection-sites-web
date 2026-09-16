"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useProspects } from "@/hooks/useProspects";
import { SyncBadge } from "@/components/SyncBadge";
import { StatCard } from "@/components/StatCard";

export default function VentesPage() {
  const { prospects, loading, loadError, syncStatus, syncMessage } = useProspects();

  if (loading) return <p className="text-sm text-inkDim">Chargement…</p>;
  if (loadError || !prospects) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
        <AlertCircle size={16} />
        {loadError || "Impossible de charger les données."}
      </div>
    );
  }

  const ventes = prospects.filter((p) => p.statut === "Gagné");
  const total = ventes.reduce((sum, p) => sum + (p.prixPropose || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Ventes</h1>
          <p className="mt-1 text-sm text-inkDim">{ventes.length} client(s) gagné(s)</p>
        </div>
        <SyncBadge status={syncStatus} message={syncMessage} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <StatCard label="Clients gagnés" value={ventes.length} />
        <StatCard label="Chiffre d'affaires" value={total.toLocaleString("fr-CH")} suffix="CHF" />
      </div>

      {ventes.length === 0 ? (
        <p className="text-sm text-inkDim">Aucune vente pour le moment.</p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-panel">
          {ventes.map((p) => (
            <li key={p.id}>
              <Link
                href={`/prospects/${p.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-panel2/60"
              >
                <div>
                  <p className="text-ink">{p.entreprise}</p>
                  <p className="mt-0.5 text-xs text-inkDim">{p.villeCanton}</p>
                </div>
                <span className="font-medium text-ink">
                  {p.prixPropose ? `${p.prixPropose.toLocaleString("fr-CH")} CHF` : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

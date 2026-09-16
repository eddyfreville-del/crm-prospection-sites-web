"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import clsx from "clsx";
import { useProspects } from "@/hooks/useProspects";
import { SyncBadge } from "@/components/SyncBadge";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RelancesPage() {
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

  const today = todayISO();
  const relances = prospects
    .filter((p) => !!p.prochaineRelance)
    .sort((a, b) => (a.prochaineRelance! < b.prochaineRelance! ? -1 : 1));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Relances</h1>
          <p className="mt-1 text-sm text-inkDim">{relances.length} relance(s) programmée(s)</p>
        </div>
        <SyncBadge status={syncStatus} message={syncMessage} />
      </div>

      {relances.length === 0 ? (
        <p className="text-sm text-inkDim">Aucune relance programmée pour le moment.</p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-panel">
          {relances.map((p) => {
            const late = p.prochaineRelance! < today;
            return (
              <li key={p.id}>
                <Link
                  href={`/prospects/${p.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-panel2/60"
                >
                  <div>
                    <p className="text-ink">{p.entreprise}</p>
                    <p className="mt-0.5 text-xs text-inkDim">
                      {p.statut} {p.villeCanton && `· ${p.villeCanton}`}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "shrink-0 rounded px-2 py-1 text-xs font-medium",
                      late ? "bg-bad/15 text-bad" : "bg-panel2 text-inkDim"
                    )}
                  >
                    {p.prochaineRelance}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

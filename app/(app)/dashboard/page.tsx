"use client";

import Link from "next/link";
import { useProspects } from "@/hooks/useProspects";
import { computeStats } from "@/lib/stats";
import { StatCard } from "@/components/StatCard";
import { SyncBadge } from "@/components/SyncBadge";
import { AlertCircle } from "lucide-react";

const DAILY_GOAL = 50;

export default function DashboardPage() {
  const { prospects, loading, loadError, syncStatus, syncMessage } = useProspects();

  if (loading) {
    return <p className="text-sm text-inkDim">Chargement du tableau de bord…</p>;
  }

  if (loadError || !prospects) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
        <AlertCircle size={16} />
        {loadError || "Impossible de charger les données."}
      </div>
    );
  }

  const stats = computeStats(prospects);
  const goalPct = Math.min(100, Math.round((stats.contactesAujourdhui / DAILY_GOAL) * 100));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-inkDim">Vue d&apos;ensemble de la prospection.</p>
        </div>
        <SyncBadge status={syncStatus} message={syncMessage} />
      </div>

      <div className="rounded-xl border border-line bg-panel p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-ink">Objectif quotidien</p>
          <p className="text-sm text-inkDim">
            <span className="font-semibold text-ink">{stats.contactesAujourdhui}</span> / {DAILY_GOAL} prospects
            aujourd&apos;hui
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel2">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${goalPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Prospects contactés" value={stats.contactes} />
        <StatCard label="Réponses reçues" value={stats.reponses} />
        <StatCard label="Prospects intéressés" value={stats.interesses} />
        <StatCard label="Maquettes réalisées" value={stats.maquettesRealisees} />
        <StatCard label="Propositions envoyées" value={stats.propositionsEnvoyees} />
        <StatCard label="Clients gagnés" value={stats.clientsGagnes} />
        <StatCard
          label="Chiffre d'affaires"
          value={stats.chiffreAffaires.toLocaleString("fr-CH")}
          suffix="CHF"
        />
      </div>

      <div className="rounded-xl border border-line bg-panel p-5">
        <p className="text-sm font-medium text-ink">Prochaines relances</p>
        {stats.prochainesRelances.length === 0 ? (
          <p className="mt-3 text-sm text-inkDim">Aucune relance programmée.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {stats.prochainesRelances.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/prospects/${p.id}`}
                  className="flex items-center justify-between py-2.5 text-sm transition hover:opacity-80"
                >
                  <span className="text-ink">{p.entreprise}</span>
                  <span className="text-inkDim">{p.prochaineRelance}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

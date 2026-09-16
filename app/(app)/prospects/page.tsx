"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, AlertCircle, Search } from "lucide-react";
import { useProspects } from "@/hooks/useProspects";
import { STATUTS, NICHES, CANAUX, PRIORITES } from "@/lib/types";
import { SyncBadge } from "@/components/SyncBadge";

const selectCls =
  "rounded-lg border border-lineStrong bg-panel2 px-2.5 py-1.5 text-xs text-ink outline-none focus:border-accent";

export default function ProspectsPage() {
  const { prospects, loading, loadError, syncStatus, syncMessage } = useProspects();
  const [search, setSearch] = React.useState("");
  const [statut, setStatut] = React.useState("");
  const [niche, setNiche] = React.useState("");
  const [ville, setVille] = React.useState("");
  const [priorite, setPriorite] = React.useState("");
  const [canal, setCanal] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!prospects) return [];
    const q = search.trim().toLowerCase();
    return prospects.filter((p) => {
      if (q && !p.entreprise.toLowerCase().includes(q) && !p.contact.toLowerCase().includes(q)) {
        return false;
      }
      if (statut && p.statut !== statut) return false;
      if (niche && p.niche !== niche) return false;
      if (priorite && p.priorite !== priorite) return false;
      if (canal && p.canal !== canal) return false;
      if (ville && !p.villeCanton.toLowerCase().includes(ville.toLowerCase())) return false;
      return true;
    });
  }, [prospects, search, statut, niche, ville, priorite, canal]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Prospects</h1>
          <p className="mt-1 text-sm text-inkDim">{prospects ? prospects.length : "…"} au total</p>
        </div>
        <div className="flex items-center gap-3">
          <SyncBadge status={syncStatus} message={syncMessage} />
          <Link
            href="/prospects/new"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition hover:bg-accentStrong"
          >
            <Plus size={15} /> Nouveau
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-lineStrong bg-panel2 px-2.5 py-1.5">
          <Search size={14} className="text-inkDim" />
          <input
            placeholder="Rechercher une entreprise ou un contact…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-inkDim"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={selectCls} value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="">Statut</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className={selectCls} value={niche} onChange={(e) => setNiche(e.target.value)}>
          <option value="">Niche</option>
          {NICHES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <input
          placeholder="Ville / Canton"
          className={selectCls}
          value={ville}
          onChange={(e) => setVille(e.target.value)}
        />
        <select className={selectCls} value={priorite} onChange={(e) => setPriorite(e.target.value)}>
          <option value="">Priorité</option>
          {PRIORITES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className={selectCls} value={canal} onChange={(e) => setCanal(e.target.value)}>
          <option value="">Canal</option>
          {CANAUX.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-inkDim">Chargement…</p>
      ) : loadError || !prospects ? (
        <div className="flex items-center gap-2 rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
          <AlertCircle size={16} />
          {loadError || "Impossible de charger les données."}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-inkDim">Aucun prospect ne correspond à ces critères.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-xs text-inkDim">
                <th className="px-4 py-2.5 font-medium">Entreprise</th>
                <th className="px-4 py-2.5 font-medium">Statut</th>
                <th className="px-4 py-2.5 font-medium">Ville / Canton</th>
                <th className="px-4 py-2.5 font-medium">Priorité</th>
                <th className="px-4 py-2.5 font-medium">Prochaine relance</th>
                <th className="px-4 py-2.5 font-medium">Prix CHF</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-panel/60">
                  <td className="px-4 py-2.5">
                    <Link href={`/prospects/${p.id}`} className="text-ink hover:underline">
                      {p.entreprise || "Sans nom"}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-inkDim">{p.statut}</td>
                  <td className="px-4 py-2.5 text-inkDim">{p.villeCanton}</td>
                  <td className="px-4 py-2.5 text-inkDim">{p.priorite || "—"}</td>
                  <td className="px-4 py-2.5 text-inkDim">{p.prochaineRelance || "—"}</td>
                  <td className="px-4 py-2.5 text-inkDim">{p.prixPropose ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

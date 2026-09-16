"use client";

import { useProspects } from "@/hooks/useProspects";
import { KanbanBoard } from "@/components/KanbanBoard";
import { SyncBadge } from "@/components/SyncBadge";
import { AlertCircle } from "lucide-react";
import type { Statut } from "@/lib/types";

export default function PipelinePage() {
  const { prospects, loading, loadError, syncStatus, syncMessage, updateProspect } =
    useProspects();

  if (loading) return <p className="text-sm text-inkDim">Chargement du pipeline…</p>;

  if (loadError || !prospects) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
        <AlertCircle size={16} />
        {loadError || "Impossible de charger les données."}
      </div>
    );
  }

  async function handleMove(id: string, statut: Statut) {
    try {
      await updateProspect(id, { statut });
    } catch {
      // useProspects a déjà annulé le déplacement optimiste et affiche l'erreur.
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Pipeline</h1>
          <p className="mt-1 text-sm text-inkDim">Glisse une carte pour changer son statut.</p>
        </div>
        <SyncBadge status={syncStatus} message={syncMessage} />
      </div>
      <KanbanBoard prospects={prospects} onMove={handleMove} />
    </div>
  );
}

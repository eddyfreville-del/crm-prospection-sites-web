"use client";

import { useParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useProspects } from "@/hooks/useProspects";
import { ProspectForm } from "@/components/ProspectForm";
import { SyncBadge } from "@/components/SyncBadge";
import type { ProspectInput } from "@/lib/types";

export default function ProspectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { prospects, loading, loadError, syncStatus, syncMessage, updateProspect } =
    useProspects();

  if (loading) return <p className="text-sm text-inkDim">Chargement…</p>;

  if (loadError || !prospects) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
        <AlertCircle size={16} />
        {loadError || "Impossible de charger les données."}
      </div>
    );
  }

  const prospect = prospects.find((p) => p.id === id);
  if (!prospect) {
    return <p className="text-sm text-inkDim">Prospect introuvable.</p>;
  }

  async function handleSubmit(input: Partial<ProspectInput>) {
    await updateProspect(prospect!.id, input);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push("/prospects")} className="text-xs text-inkDim hover:text-ink">
            ← Retour aux prospects
          </button>
          <h1 className="mt-1 text-xl font-semibold text-ink">{prospect.entreprise}</h1>
        </div>
        <SyncBadge status={syncStatus} message={syncMessage} />
      </div>
      <ProspectForm
        initial={prospect}
        onSubmit={handleSubmit}
        submitting={syncStatus === "syncing"}
        submitLabel="Mettre à jour"
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useIdentity } from "@/lib/identity";
import type { Prospect, ProspectInput } from "@/lib/types";
import type { SyncStatus } from "@/components/SyncBadge";

interface ApiError {
  error: string;
}

export function useProspects() {
  const { authFetch } = useIdentity();
  const [prospects, setProspects] = React.useState<Prospect[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>("idle");
  const [syncMessage, setSyncMessage] = React.useState<string | undefined>();

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await authFetch("/api/prospects");
      const body = await res.json();
      if (!res.ok) throw new Error((body as ApiError).error || "Erreur de chargement.");
      setProspects(body.prospects);
    } catch (err: any) {
      setLoadError(err?.message || "Impossible de charger les prospects depuis Notion.");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  React.useEffect(() => {
    load();
  }, [load]);

  /** Crée un prospect. Ne retourne le prospect créé que si Notion a confirmé. */
  const createProspect = React.useCallback(
    async (input: Partial<ProspectInput>): Promise<Prospect> => {
      setSyncStatus("syncing");
      try {
        const res = await authFetch("/api/prospects", {
          method: "POST",
          body: JSON.stringify(input),
        });
        const body = await res.json();
        if (!res.ok) throw new Error((body as ApiError).error || "Erreur de création.");
        setProspects((prev) => (prev ? [body.prospect, ...prev] : [body.prospect]));
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 2000);
        return body.prospect as Prospect;
      } catch (err: any) {
        setSyncStatus("error");
        setSyncMessage(err?.message);
        throw err;
      }
    },
    [authFetch]
  );

  /**
   * Met à jour un prospect avec mise à jour optimiste de la liste locale.
   * Si Notion refuse la modification, l'état local est restauré — jamais de
   * faux "synchronisé" affiché après un échec réel de l'API.
   */
  const updateProspect = React.useCallback(
    async (id: string, patch: Partial<ProspectInput>) => {
      const previous = prospects;
      setProspects((prev) =>
        prev ? prev.map((p) => (p.id === id ? { ...p, ...patch } : p)) : prev
      );
      setSyncStatus("syncing");
      try {
        const res = await authFetch(`/api/prospects/${id}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        const body = await res.json();
        if (!res.ok) throw new Error((body as ApiError).error || "Erreur de mise à jour.");
        setProspects((prev) =>
          prev ? prev.map((p) => (p.id === id ? body.prospect : p)) : prev
        );
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 2000);
        return body.prospect as Prospect;
      } catch (err: any) {
        setProspects(previous);
        setSyncStatus("error");
        setSyncMessage(err?.message);
        throw err;
      }
    },
    [authFetch, prospects]
  );

  return {
    prospects,
    loading,
    loadError,
    syncStatus,
    syncMessage,
    reload: load,
    createProspect,
    updateProspect,
  };
}

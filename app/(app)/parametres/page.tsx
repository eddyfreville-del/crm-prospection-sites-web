"use client";

import * as React from "react";
import { useIdentity } from "@/lib/identity";

export default function ParametresPage() {
  const { user, authFetch } = useIdentity();
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function runSetup() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await authFetch("/api/admin/setup-notion", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Erreur inconnue.");
      setResult(body);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la création de la base.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Paramètres</h1>
        <p className="mt-1 text-sm text-inkDim">Connecté en tant que {user?.email}</p>
      </div>

      <div className="rounded-xl border border-line bg-panel p-5">
        <p className="text-sm font-medium text-ink">Objectif quotidien</p>
        <p className="mt-2 text-sm text-inkDim">
          Fixé à <strong className="text-ink">50 prospects contactés par jour</strong>, visible sur
          le Dashboard.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-panel p-5">
        <p className="text-sm font-medium text-ink">Initialisation de la base Notion</p>
        <p className="mt-2 text-sm text-inkDim">
          À utiliser une seule fois, après le tout premier déploiement, pour créer la base
          « CRM — Prospection Sites Web » avec toutes les bonnes colonnes. Sans effet si
          <code className="mx-1 rounded bg-panel2 px-1 py-0.5 text-xs">NOTION_DATABASE_ID</code>
          est déjà configuré.
        </p>
        <button
          onClick={runSetup}
          disabled={running}
          className="mt-4 rounded-lg border border-lineStrong bg-panel2 px-4 py-2 text-sm font-medium text-ink transition hover:bg-panel2/70 disabled:opacity-50"
        >
          {running ? "Création en cours…" : "Créer la base Notion"}
        </button>

        {error && (
          <p className="mt-3 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">
            {error}
          </p>
        )}
        {result && (
          <div className="mt-3 space-y-1 rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-sm text-good">
            <p>{result.message}</p>
            <p className="font-mono text-xs">NOTION_DATABASE_ID={result.NOTION_DATABASE_ID}</p>
            <p className="font-mono text-xs">NOTION_DATA_SOURCE_ID={result.NOTION_DATA_SOURCE_ID}</p>
          </div>
        )}
      </div>
    </div>
  );
}

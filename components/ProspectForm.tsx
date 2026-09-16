"use client";

import * as React from "react";
import { STATUTS, NICHES, CANAUX, PRIORITES, type Prospect, type ProspectInput } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-inkDim">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-lineStrong bg-panel2 px-3 py-2 text-sm text-ink outline-none transition focus:border-accent";

export function ProspectForm({
  initial,
  onSubmit,
  submitting,
  submitLabel = "Enregistrer",
}: {
  initial?: Partial<Prospect>;
  onSubmit: (input: Partial<ProspectInput>) => Promise<void>;
  submitting: boolean;
  submitLabel?: string;
}) {
  const [values, setValues] = React.useState<Partial<ProspectInput>>({
    entreprise: initial?.entreprise || "",
    statut: initial?.statut || "À contacter",
    contact: initial?.contact || "",
    email: initial?.email || "",
    telephone: initial?.telephone || "",
    siteActuel: initial?.siteActuel || "",
    villeCanton: initial?.villeCanton || "",
    niche: initial?.niche ?? null,
    canal: initial?.canal ?? null,
    priorite: initial?.priorite ?? null,
    datePremierContact: initial?.datePremierContact ?? null,
    dernierContact: initial?.dernierContact ?? null,
    prochaineRelance: initial?.prochaineRelance ?? null,
    prixPropose: initial?.prixPropose ?? null,
    maquette: initial?.maquette || "",
    notes: initial?.notes || "",
  });
  const [error, setError] = React.useState<string | null>(null);

  function set<K extends keyof ProspectInput>(key: K, value: ProspectInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.entreprise?.trim()) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }
    try {
      await onSubmit(values);
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Entreprise">
          <input
            className={inputCls}
            value={values.entreprise}
            onChange={(e) => set("entreprise", e.target.value)}
            required
          />
        </Field>
        <Field label="Statut">
          <select
            className={inputCls}
            value={values.statut}
            onChange={(e) => set("statut", e.target.value as ProspectInput["statut"])}
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Contact">
          <input
            className={inputCls}
            value={values.contact}
            onChange={(e) => set("contact", e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={inputCls}
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>

        <Field label="Téléphone">
          <input
            className={inputCls}
            value={values.telephone}
            onChange={(e) => set("telephone", e.target.value)}
          />
        </Field>
        <Field label="Site actuel">
          <input
            className={inputCls}
            placeholder="https://…"
            value={values.siteActuel}
            onChange={(e) => set("siteActuel", e.target.value)}
          />
        </Field>

        <Field label="Ville / Canton">
          <input
            className={inputCls}
            value={values.villeCanton}
            onChange={(e) => set("villeCanton", e.target.value)}
          />
        </Field>
        <Field label="Niche">
          <select
            className={inputCls}
            value={values.niche ?? ""}
            onChange={(e) => set("niche", (e.target.value || null) as ProspectInput["niche"])}
          >
            <option value="">—</option>
            {NICHES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Canal">
          <select
            className={inputCls}
            value={values.canal ?? ""}
            onChange={(e) => set("canal", (e.target.value || null) as ProspectInput["canal"])}
          >
            <option value="">—</option>
            {CANAUX.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priorité">
          <select
            className={inputCls}
            value={values.priorite ?? ""}
            onChange={(e) =>
              set("priorite", (e.target.value || null) as ProspectInput["priorite"])
            }
          >
            <option value="">—</option>
            {PRIORITES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date premier contact">
          <input
            type="date"
            className={inputCls}
            value={values.datePremierContact ?? ""}
            onChange={(e) => set("datePremierContact", e.target.value || null)}
          />
        </Field>
        <Field label="Dernier contact">
          <input
            type="date"
            className={inputCls}
            value={values.dernierContact ?? ""}
            onChange={(e) => set("dernierContact", e.target.value || null)}
          />
        </Field>

        <Field label="Prochaine relance">
          <input
            type="date"
            className={inputCls}
            value={values.prochaineRelance ?? ""}
            onChange={(e) => set("prochaineRelance", e.target.value || null)}
          />
        </Field>
        <Field label="Prix proposé CHF">
          <input
            type="number"
            min={0}
            className={inputCls}
            value={values.prixPropose ?? ""}
            onChange={(e) => set("prixPropose", e.target.value ? Number(e.target.value) : null)}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Maquette (URL)">
            <input
              className={inputCls}
              placeholder="https://…"
              value={values.maquette}
              onChange={(e) => set("maquette", e.target.value)}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Notes">
            <textarea
              className={inputCls}
              rows={5}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accentStrong disabled:opacity-50"
      >
        {submitting ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}

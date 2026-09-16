"use client";

import { useRouter } from "next/navigation";
import { useProspects } from "@/hooks/useProspects";
import { ProspectForm } from "@/components/ProspectForm";
import type { ProspectInput } from "@/lib/types";

export default function NewProspectPage() {
  const router = useRouter();
  const { createProspect, syncStatus } = useProspects();

  async function handleSubmit(input: Partial<ProspectInput>) {
    const prospect = await createProspect(input);
    router.push(`/prospects/${prospect.id}`);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-ink">Nouveau prospect</h1>
      <ProspectForm onSubmit={handleSubmit} submitting={syncStatus === "syncing"} submitLabel="Créer" />
    </div>
  );
}

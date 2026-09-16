import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import clsx from "clsx";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

export function SyncBadge({ status, message }: { status: SyncStatus; message?: string }) {
  if (status === "idle") return null;

  const config = {
    syncing: { icon: Loader2, label: "Synchronisation en cours…", cls: "text-inkDim", spin: true },
    synced: { icon: CheckCircle2, label: "Synchronisé", cls: "text-good", spin: false },
    error: { icon: AlertCircle, label: message || "Erreur de synchronisation", cls: "text-bad", spin: false },
  }[status];

  const Icon = config.icon;

  return (
    <div className={clsx("flex items-center gap-1.5 text-xs", config.cls)}>
      <Icon size={13} className={config.spin ? "animate-spin" : undefined} />
      {config.label}
    </div>
  );
}

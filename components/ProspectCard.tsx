"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import type { Prospect } from "@/lib/types";

const PRIORITE_CLS: Record<string, string> = {
  Haute: "bg-bad/15 text-bad",
  Moyenne: "bg-warn/15 text-warn",
  Basse: "bg-inkDim/15 text-inkDim",
};

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: prospect.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "cursor-grab space-y-2 rounded-lg border border-line bg-panel2 p-3 text-sm shadow-sm active:cursor-grabbing",
        isDragging && "z-10 opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/prospects/${prospect.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-ink hover:underline"
        >
          {prospect.entreprise || "Sans nom"}
        </Link>
        {prospect.priorite && (
          <span
            className={clsx(
              "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
              PRIORITE_CLS[prospect.priorite]
            )}
          >
            {prospect.priorite}
          </span>
        )}
      </div>
      {prospect.villeCanton && <p className="text-xs text-inkDim">{prospect.villeCanton}</p>}
      {prospect.contact && <p className="text-xs text-inkDim">{prospect.contact}</p>}
      <div className="flex items-center justify-between text-xs text-inkDim">
        {prospect.prochaineRelance ? <span>↻ {prospect.prochaineRelance}</span> : <span />}
        {prospect.prixPropose ? (
          <span className="font-medium text-ink">{prospect.prixPropose} CHF</span>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import clsx from "clsx";
import { STATUTS, type Prospect, type Statut } from "@/lib/types";
import { ProspectCard } from "./ProspectCard";

function Column({ statut, prospects }: { statut: Statut; prospects: Prospect[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: statut });

  return (
    <div className="flex w-64 shrink-0 flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-xs font-medium text-inkDim">{statut}</p>
        <span className="text-xs text-inkDim">{prospects.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl border border-line bg-panel/60 p-2 transition",
          isOver && "border-accent/50 bg-accent/5"
        )}
      >
        {prospects.map((p) => (
          <ProspectCard key={p.id} prospect={p} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({
  prospects,
  onMove,
}: {
  prospects: Prospect[];
  onMove: (id: string, statut: Statut) => void;
}) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatut = over.id as Statut;
    const prospect = prospects.find((p) => p.id === active.id);
    if (prospect && prospect.statut !== newStatut) {
      onMove(prospect.id, newStatut);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {STATUTS.map((statut) => (
          <Column
            key={statut}
            statut={statut}
            prospects={prospects.filter((p) => p.statut === statut)}
          />
        ))}
      </div>
    </DndContext>
  );
}

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { StopDocumentType } from "@/lib/rxdb-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";

type SortableStopCardProps = {
  stop: StopDocumentType;
  index: number;
  children: React.ReactNode;
};

export function SortableStopCard({ stop, index, children }: SortableStopCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: stop.id,
  });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-2xl"
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs uppercase">Day {index}</p>
          <CardTitle className="font-serif text-2xl">{stop.name}</CardTitle>
          <p className="text-muted-foreground text-sm">{stop.date}</p>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground rounded-lg p-2"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${stop.name}`}
        >
          <GripVertical />
        </button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

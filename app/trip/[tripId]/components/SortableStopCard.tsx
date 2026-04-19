"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { StopDocumentType } from "@/lib/rxdb-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { capitalize } from "@/lib/utils";

type SortableStopCardProps = {
  stop: StopDocumentType;
  index: number;
  children: React.ReactNode;
};

export function SortableStopCard({ stop, index, children }: SortableStopCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: stop.id,
    });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-2xl"
    >
      <CardHeader className="flex flex-row items-center gap-1 pb-4">
        <button
          type="button"
          className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${stop.name}`}
        >
          <GripVertical />
        </button>
        <div className="h-8 w-8 rounded-full bg-primary-muted text-primary flex items-center justify-center font-serif font-semibold shrink-0">
          {index}
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="font-serif text-2xl">
            {capitalize(stop.name)}
          </CardTitle>
          <p className="text-muted-foreground text-sm">{stop.date}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

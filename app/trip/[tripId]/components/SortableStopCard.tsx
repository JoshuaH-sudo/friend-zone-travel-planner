"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { StopDocumentType } from "@/lib/rxdb-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { formatDate } from "date-fns";

type SortableStopCardProps = {
  stop: StopDocumentType;
  index: number;
  children: React.ReactNode;
};

export function SortableStopCard({
  stop,
  index,
  children,
}: SortableStopCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: stop.id,
    });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-2xl pb-0 shadow-md"
    >
      <CardHeader className="flex flex-row items-center gap-1 pb-4">
        <div className="flex flex-row items-start gap-2">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mt-1 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${stop.name}`}
          >
            <GripVertical />
          </button>
          <div className="bg-primary-muted text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif font-semibold">
            {index}
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className="font-serif text-2xl">
              {capitalize(stop.name)}
            </CardTitle>
            <p className="text-muted-foreground text-sm">{formatDate(new Date(stop.date), "PPP")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-secondary/30 space-y-3 border-t px-4 py-3 sm:px-5">
        {children}
      </CardContent>
    </Card>
  );
}

"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import type {
  AccommodationDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useMemo, useState } from "react";
import { SortableStopCard } from "./SortableStopCard";
import { StopItemForm } from "./StopItemForm";
import { toast } from "sonner";

type OverviewTabProps = {
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  onAddStop: (name: string, date: string) => Promise<void>;
  onAddAccommodation: (stopId: string, name: string, date: string) => Promise<void>;
  onAddTransport: (stopId: string, name: string, date: string) => Promise<void>;
};

function shiftDate(base: string, plusDays: number) {
  const date = new Date(`${base}T00:00:00`);
  date.setDate(date.getDate() + plusDays);
  return date.toISOString().slice(0, 10);
}

export function OverviewTab({
  stops,
  accommodationsByStop,
  transportsByStop,
  onAddStop,
  onAddAccommodation,
  onAddTransport,
}: OverviewTabProps) {
  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.date.localeCompare(b.date)),
    [stops],
  );
  const [order, setOrder] = useState<string[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeOrder =
    order.length === sortedStops.length ? order : sortedStops.map((stop) => stop.id);
  const orderedStops = activeOrder
    .map((id) => sortedStops.find((stop) => stop.id === id))
    .filter((stop): stop is StopDocumentType => Boolean(stop));

  const persistOrder = async (ids: string[]) => {
    if (ids.length === 0) return;
    const firstDate = sortedStops[0]?.date ?? new Date().toISOString().slice(0, 10);
    await Promise.all(
      ids.map(async (id, index) => {
        const stop = sortedStops.find((item) => item.id === id);
        if (!stop) return;
        await stop.patch({
          date: shiftDate(firstDate, index),
          updatedAt: Date.now(),
        });
      }),
    );
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = activeOrder.indexOf(String(active.id));
    const to = activeOrder.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const nextOrder = arrayMove(activeOrder, from, to);
    const previousOrder = [...activeOrder];
    setOrder(nextOrder);
    await persistOrder(nextOrder);
    toast("Stop order updated.", {
      action: {
        label: "Undo",
        onClick: async () => {
          setOrder(previousOrder);
          await persistOrder(previousOrder);
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <StopItemForm
        placeholder="Add stop"
        onSubmit={async ({ name, date }) => {
          await onAddStop(name, date);
        }}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={activeOrder} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {orderedStops.map((stop, index) => (
              <SortableStopCard key={stop.id} stop={stop} index={index + 1}>
                <div className="flex flex-col gap-2">
                  <details className="bg-muted/40 rounded-xl p-3">
                    <summary className="text-sm font-medium">Accommodations</summary>
                    <div className="mt-2 flex flex-col gap-2">
                      {(accommodationsByStop[stop.id] || []).map((item) => (
                        <p key={item.id} className="text-muted-foreground text-sm">
                          {item.name}
                        </p>
                      ))}
                      <StopItemForm
                        placeholder="Add accommodation"
                        defaultDate={stop.date}
                        onSubmit={async ({ name, date }) => {
                          await onAddAccommodation(stop.id, name, date);
                        }}
                      />
                    </div>
                  </details>
                  <details className="bg-muted/40 rounded-xl p-3">
                    <summary className="text-sm font-medium">Transports</summary>
                    <div className="mt-2 flex flex-col gap-2">
                      {(transportsByStop[stop.id] || []).map((item) => (
                        <p key={item.id} className="text-muted-foreground text-sm">
                          {item.name}
                        </p>
                      ))}
                      <StopItemForm
                        placeholder="Add transport"
                        defaultDate={stop.date}
                        onSubmit={async ({ name, date }) => {
                          await onAddTransport(stop.id, name, date);
                        }}
                      />
                    </div>
                  </details>
                </div>
              </SortableStopCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {orderedStops.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-center">
          No stops yet.
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top
        </Button>
      </div>
    </div>
  );
}

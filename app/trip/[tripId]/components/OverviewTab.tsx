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
import { addDays, format } from "date-fns";
import { Transport } from "./Transport";
import { Accommodation } from "./Accommodation";

type OverviewTabProps = {
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  onAddStop: (name: string, date: string) => Promise<void>;
  onAddAccommodation: (
    stopId: string,
    payload: { name: string; price: number; currency: string; checkIn: string; checkOut: string },
  ) => Promise<void>;
  onAddTransport: (
    stopId: string,
    payload: {
      name: string;
      price: number;
      currency: string;
      departureDateTime: string;
      arrivalDateTime: string;
    },
  ) => Promise<void>;
};

function shiftDate(base: string, plusDays: number) {
  return format(addDays(new Date(`${base}T00:00:00`), plusDays), "yyyy-MM-dd");
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
    try {
      await persistOrder(nextOrder);
    } catch (error) {
      console.error(error);
      setOrder(previousOrder);
      toast.error("Could not reorder stops.");
      return;
    }
    toast("Stop order updated.", {
      action: {
        label: "Undo",
        onClick: async () => {
          try {
            setOrder(previousOrder);
            await persistOrder(previousOrder);
          } catch (error) {
            console.error(error);
            toast.error("Undo failed.");
          }
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={activeOrder} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {orderedStops.map((stop, index) => (
              <SortableStopCard key={stop.id} index={index + 1} stop={stop}>
                <div className="flex flex-col gap-2">
                  <details className="bg-muted/40 rounded-xl p-3">
                    <summary className="text-sm font-medium">Accommodations</summary>
                    <div className="mt-2 flex flex-col gap-2">
                      {(accommodationsByStop[stop.id] || []).map((item) => (
                        <Accommodation key={item.id} accommodation={item} />
                      ))}
                      <StopItemForm
                        kind="accommodation"
                        placeholder="Add accommodation"
                        defaultDate={stop.date}
                        onSubmit={async ({
                          name,
                          price,
                          currency,
                          startDateTime,
                          endDateTime,
                        }) => {
                          if (!startDateTime || !endDateTime) return;
                          await onAddAccommodation(stop.id, {
                            name,
                            price,
                            currency,
                            checkIn: startDateTime,
                            checkOut: endDateTime,
                          });
                        }}
                      />
                    </div>
                  </details>
                  <details className="bg-muted/40 rounded-xl p-3">
                    <summary className="text-sm font-medium">Transports</summary>
                    <div className="mt-2 flex flex-col gap-2">
                      {(transportsByStop[stop.id] || []).map((item) => (
                        <Transport key={item.id} transport={item} />
                      ))}
                      <StopItemForm
                        kind="transport"
                        placeholder="Add transport"
                        defaultDate={stop.date}
                        onSubmit={async ({
                          name,
                          price,
                          currency,
                          startDateTime,
                          endDateTime,
                        }) => {
                          if (!startDateTime || !endDateTime) return;
                          await onAddTransport(stop.id, {
                            name,
                            price,
                            currency,
                            departureDateTime: startDateTime,
                            arrivalDateTime: endDateTime,
                          });
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
      <StopItemForm
        kind="stop"
        placeholder="Add another stop..."
        stopBottomLayout
        onSubmit={async ({ name, date }) => {
          if (!date) {
            toast.error("A date is required for this stop.");
            return;
          }
          await onAddStop(name, date);
        }}
      />
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top
        </Button>
      </div>
    </div>
  );
}

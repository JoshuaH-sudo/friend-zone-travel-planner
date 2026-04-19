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
import { Input } from "@/components/ui/input";
import type {
  AccommodationDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useMemo, useState } from "react";
import { SortableStopCard } from "./SortableStopCard";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { Transport } from "./Transport";
import { Accommodation } from "./Accommodation";
import { AccommodationForm } from "./AccommodationForm";
import { TransportForm } from "./TransportForm";
import { Bed, Bus, Plane } from "lucide-react";
import { Flight } from "@hugeicons/core-free-icons";

type OverviewTabProps = {
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  onAddStop: (name: string, date: string) => Promise<void>;
  onAddAccommodation: (
    stopId: string,
    payload: {
      name: string;
      price: number;
      currency: string;
      checkIn: string;
      checkOut: string;
    },
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

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
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
  const [addingAccommodationForStopId, setAddingAccommodationForStopId] =
    useState<string | null>(null);
  const [addingTransportForStopId, setAddingTransportForStopId] = useState<
    string | null
  >(null);
  const [showAddTripForm, setShowAddTripForm] = useState(false);
  const [newStopName, setNewStopName] = useState("");
  const [newStopDate, setNewStopDate] = useState(getTodayDate());
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeOrder =
    order.length === sortedStops.length
      ? order
      : sortedStops.map((stop) => stop.id);
  const orderedStops = activeOrder
    .map((id) => sortedStops.find((stop) => stop.id === id))
    .filter((stop): stop is StopDocumentType => Boolean(stop));

  const persistOrder = async (ids: string[]) => {
    if (ids.length === 0) return;
    const firstDate =
      sortedStops[0]?.date ?? new Date().toISOString().slice(0, 10);
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
        <SortableContext
          items={activeOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {orderedStops.map((stop, index) => (
              <SortableStopCard key={stop.id} index={index + 1} stop={stop}>
                <div className="flex flex-col gap-4">
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
                      <Bed className="text-muted-foreground h-4 w-4" />
                      <p>Stays</p>
                    </div>
                    {accommodationsByStop[stop.id]?.length === 0 && (
                      <p className="text-muted-foreground">
                        No stays for this stop.
                      </p>
                    )}
                    {(accommodationsByStop[stop.id] || []).map((item) => (
                      <Accommodation key={item.id} accommodation={item} />
                    ))}
                    {addingAccommodationForStopId === stop.id ? (
                      <div className="border-border/50 bg-muted/30 rounded-xl border p-3">
                        <AccommodationForm
                          initialValues={{
                            name: "",
                            price: 0,
                            currency: "USD",
                            checkIn: `${stop.date}T14:00`,
                            checkOut: `${stop.date}T11:00`,
                            timezone: undefined,
                          }}
                          onSubmit={async (data) => {
                            await onAddAccommodation(stop.id, {
                              name: data.name,
                              price: data.price,
                              currency: data.currency,
                              checkIn: data.checkIn,
                              checkOut: data.checkOut,
                            });
                            setAddingAccommodationForStopId(null);
                          }}
                          onCancel={() => setAddingAccommodationForStopId(null)}
                          submitLabel="Add trip"
                          cancelLabel="Cancel"
                          autoFocusName
                        />
                      </div>
                    ) : (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setAddingAccommodationForStopId(stop.id)
                          }
                        >
                          Add trip
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
                    <Plane className="text-muted-foreground h-4 w-4" />
                    <p>Journeys</p>
                  </div>
                  {transportsByStop[stop.id]?.length === 0 && (
                    <p className="text-muted-foreground">
                      No journeys for this stop.
                    </p>
                  )}
                  <div className="mt-2 flex flex-col gap-2">
                    {(transportsByStop[stop.id] || []).map((item) => (
                      <Transport key={item.id} transport={item} />
                    ))}
                    {addingTransportForStopId === stop.id ? (
                      <div className="border-border/50 bg-muted/30 rounded-xl border p-3">
                        <TransportForm
                          initialValues={{
                            name: "",
                            type: "flight",
                            price: 0,
                            currency: "USD",
                            departureDateTime: `${stop.date}T12:00`,
                            arrivalDateTime: `${stop.date}T13:00`,
                            timezone: undefined,
                          }}
                          onSubmit={async (data) => {
                            await onAddTransport(stop.id, {
                              name: data.name,
                              price: data.price,
                              currency: data.currency,
                              departureDateTime: data.departureDateTime,
                              arrivalDateTime: data.arrivalDateTime ?? "",
                            });
                            setAddingTransportForStopId(null);
                          }}
                          onCancel={() => setAddingTransportForStopId(null)}
                          submitLabel="Add journey"
                          cancelLabel="Cancel"
                          autoFocusName
                        />
                      </div>
                    ) : (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddingTransportForStopId(stop.id)}
                        >
                          Add journey
                        </Button>
                      </div>
                    )}
                  </div>
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
      {showAddTripForm ? (
        <form
          className="bg-muted/30 flex flex-wrap items-end gap-2 rounded-2xl border p-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!newStopName.trim()) return;
            if (!newStopDate) {
              toast.error("A date is required for this stop.");
              return;
            }
            await onAddStop(newStopName.trim(), newStopDate);
            setNewStopName("");
            setNewStopDate(getTodayDate());
            setShowAddTripForm(false);
          }}
        >
          <Input
            value={newStopName}
            onChange={(event) => setNewStopName(event.target.value)}
            placeholder="Add another stop..."
            className="min-w-56 flex-1 rounded-xl bg-white/80"
          />
          <Input
            type="date"
            value={newStopDate}
            onChange={(event) => setNewStopDate(event.target.value)}
            className="w-40 rounded-xl bg-white/80"
          />
          <Button type="submit" className="h-10 rounded-xl px-4">
            Add trip
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAddTripForm(false)}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <div>
          <Button variant="outline" onClick={() => setShowAddTripForm(true)}>
            Add trip
          </Button>
        </div>
      )}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to top
        </Button>
      </div>
    </div>
  );
}

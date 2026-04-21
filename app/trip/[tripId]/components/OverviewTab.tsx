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
import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { Transport } from "./Transport";
import { useTranslations } from "next-intl";
import { useSettings } from "@/lib/SettingsProvider";
import posthog from "posthog-js";
import { Expenses } from "./Expenses";
import { SortableStopCard } from "./SortableStopCard";
import { Input } from "@base-ui/react";
import { Bed, Plus, Plane, CreditCard } from "lucide-react";
import { Accommodation } from "./Accommodation";
import { AccommodationForm } from "./AccommodationForm";
import { TransportForm } from "./TransportForm";
import { Button } from "@/components/ui/button";

type OverviewTabProps = {
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expensesByStop?: Record<string, ExpenseDocumentType[]>;
  onAddStop: (name: string, date: string) => Promise<void>;
  onAddAccommodation: (
    stopId: string,
    payload: {
      name: string;
      price: number;
      currency: string;
      checkIn: string;
      checkOut: string;
      timezone?: string;
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
      timezone?: string;
    },
  ) => Promise<void>;
};

function shiftDate(base: string, plusDays: number) {
  return format(addDays(new Date(`${base}T00:00:00`), plusDays), "yyyy-MM-dd");
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export const OverviewTab = ({
  stops,
  accommodationsByStop,
  transportsByStop,
  expensesByStop = {},
  onAddStop,
  onAddAccommodation,
  onAddTransport,
}: OverviewTabProps & {
  expensesByStop?: Record<string, ExpenseDocumentType[]>;
}) => {
  const t = useTranslations("overviewTab");
  const { defaultCurrency, timezone } = useSettings();
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
      toast.error(t("toast.reorderFailed"));
      return;
    }
    posthog.capture("stop_reordered", { stop_count: stops.length });
    toast(t("toast.reorderUpdated"), {
      action: {
        label: t("toast.undo"),
        onClick: async () => {
          try {
            setOrder(previousOrder);
            await persistOrder(previousOrder);
          } catch (error) {
            console.error(error);
            toast.error(t("toast.undoFailed"));
          }
        },
      },
    });
  };

  const handleEditStopName = async (stopId: string, newName: string) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;
    await stop.patch({ name: newName, updatedAt: Date.now() });
  };

  const handleDeleteStop = async (stopId: string) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;
    // Delete related accommodations and transports first
    const accoms = accommodationsByStop[stopId] || [];
    const trans = transportsByStop[stopId] || [];
    await Promise.all([
      ...accoms.map((a) => a.remove()),
      ...trans.map((t) => t.remove()),
      stop.remove(),
    ]);
    posthog.capture("stop_deleted", {
      accommodations_deleted: accoms.length,
      transports_deleted: trans.length,
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
              <SortableStopCard
                key={stop.id}
                index={index + 1}
                stop={stop}
                accommodations={accommodationsByStop[stop.id] || []}
                transports={transportsByStop[stop.id] || []}
                onDeleteStop={() => handleDeleteStop(stop.id)}
                onEditStopName={(newName) =>
                  handleEditStopName(stop.id, newName)
                }
              >
                <div className="flex flex-col gap-4">
                  <section>
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
                        <Bed className="text-muted-foreground h-4 w-4" />
                        <p>{t("sections.stays")}</p>
                      </div>
                      {accommodationsByStop[stop.id]?.length === 0 && (
                        <p className="text-muted-foreground">
                          {t("sections.noStays")}
                        </p>
                      )}
                      {(accommodationsByStop[stop.id] || []).map((item) => (
                        <Accommodation key={item.id} accommodation={item} />
                      ))}
                      {addingAccommodationForStopId === stop.id ? (
                        <div className="border-border/50 bg-card rounded-xl border p-3">
                          <AccommodationForm
                            initialValues={{
                              name: "",
                              price: 0,
                              currency: defaultCurrency,
                              checkIn: `${stop.date}T14:00`,
                              checkOut: `${stop.date}T11:00`,
                              timezone,
                            }}
                            onSubmit={async (data) => {
                              await onAddAccommodation(stop.id, {
                                name: data.name,
                                price: data.price,
                                currency: data.currency,
                                checkIn: data.checkIn,
                                checkOut: data.checkOut,
                                timezone: data.timezone,
                              });
                              setAddingAccommodationForStopId(null);
                            }}
                            onCancel={() =>
                              setAddingAccommodationForStopId(null)
                            }
                            submitLabel={t("actions.addStay")}
                            cancelLabel={t("actions.cancel")}
                            autoFocusName
                          />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setAddingAccommodationForStopId(stop.id)
                          }
                          className="text-muted-foreground w-fit px-0"
                        >
                          <Plus className="h-4 w-4" />
                          {t("actions.addStay")}
                        </Button>
                      )}
                    </div>
                  </section>
                  <section>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
                      <Plane className="text-muted-foreground h-4 w-4" />
                      <p>{t("sections.journeys")}</p>
                    </div>
                    {transportsByStop[stop.id]?.length === 0 && (
                      <p className="text-muted-foreground">
                        {t("sections.noJourneys")}
                      </p>
                    )}
                    <div className="mt-2 flex flex-col gap-2">
                      {(transportsByStop[stop.id] || []).map((item) => (
                        <Transport key={item.id} transport={item} />
                      ))}
                      {addingTransportForStopId === stop.id ? (
                        <div className="border-border/50 bg-card rounded-xl border p-3">
                          <TransportForm
                            initialValues={{
                              name: "",
                              type: "flight",
                              price: 0,
                              currency: defaultCurrency,
                              departureDateTime: `${stop.date}T12:00`,
                              arrivalDateTime: `${stop.date}T13:00`,
                              timezone,
                            }}
                            onSubmit={async (data) => {
                              await onAddTransport(stop.id, {
                                name: data.name,
                                price: data.price,
                                currency: data.currency,
                                departureDateTime: data.departureDateTime,
                                arrivalDateTime: data.arrivalDateTime ?? "",
                                timezone: data.timezone,
                              });
                              setAddingTransportForStopId(null);
                            }}
                            onCancel={() => setAddingTransportForStopId(null)}
                            submitLabel={t("actions.addJourney")}
                            cancelLabel={t("actions.cancel")}
                            autoFocusName
                          />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddingTransportForStopId(stop.id)}
                          className="text-muted-foreground w-fit px-0"
                        >
                          <Plus className="h-4 w-4" />
                          {t("actions.addJourney")}
                        </Button>
                      )}
                    </div>
                  </section>
                  <section>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
                      <CreditCard className="text-muted-foreground h-4 w-4" />
                      <p>{t("sections.expenses")}</p>
                    </div>
                    <Expenses
                      stopId={stop.id}
                      tripId={stop.tripId}
                      expenses={expensesByStop[stop.id] || []}
                      defaultCurrency={defaultCurrency}
                    />
                  </section>
                </div>
              </SortableStopCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {orderedStops.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-center">
          {t("empty.noStops")}
        </div>
      ) : null}
      <form
        className="bg-muted/30 flex flex-wrap items-end gap-2 rounded-2xl border p-3"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!newStopName.trim()) return;
          if (!newStopDate) {
            toast.error(t("validation.dateRequired"));
            return;
          }
          await onAddStop(newStopName.trim(), newStopDate);
          setNewStopName("");
          setNewStopDate(getTodayDate());
        }}
      >
        <Input
          value={newStopName}
          onChange={(event) => setNewStopName(event.target.value)}
          placeholder={t("addStop.placeholder")}
          className="bg-input min-w-56 flex-1 rounded-xl"
        />
        <Input
          type="date"
          value={newStopDate}
          onChange={(event) => setNewStopDate(event.target.value)}
          className="bg-input w-40 rounded-xl"
        />
        <Button type="submit" className="h-10 rounded-xl px-4">
          {t("addStop.submit")}
        </Button>
      </form>
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {t("actions.backToTop")}
        </Button>
      </div>
    </div>
  );
};

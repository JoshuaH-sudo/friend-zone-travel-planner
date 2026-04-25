"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Transport } from "./Transport";
import { useTranslations } from "next-intl";
import { Expenses } from "./Expenses";
import { Input } from "@base-ui/react";
import { Bed, Plus, Plane, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Accommodation } from "./Accommodation";
import { AccommodationForm } from "./AccommodationForm";
import { TransportForm } from "./TransportForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalize } from "@/lib/utils";
import { convert, formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/SettingsProvider";
import { useExchangeRates } from "@/lib/useExchangeRates";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export type StopCardProps = {
  index: number;
  stop: StopDocumentType;
  accommodations: AccommodationDocumentType[];
  transports: TransportDocumentType[];
  expenses: ExpenseDocumentType[];
  defaultCurrency: string;
  timezone: string;
  addingAccommodation: boolean;
  addingTransport: boolean;
  onStartAddAccommodation: () => void;
  onCancelAddAccommodation: () => void;
  onStartAddTransport: () => void;
  onCancelAddTransport: () => void;
  onAddAccommodation: (data: {
    name: string;
    price: number;
    currency: string;
    checkIn: string;
    checkOut: string;
    timezone?: string;
  }) => Promise<void>;
  onAddTransport: (data: {
    name: string;
    price: number;
    currency: string;
    departureDateTime: string;
    arrivalDateTime: string;
    timezone?: string;
  }) => Promise<void>;
  onEditStopName: (newName: string) => Promise<void>;
  onDeleteStop: () => Promise<void>;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Collects all item date strings for a set of accommodations and transports.
 * Used both for sorting stops and for computing date range summaries.
 */
export function getAllItemDates(
  accommodations: AccommodationDocumentType[],
  transports: TransportDocumentType[],
): string[] {
  return [
    ...accommodations.map((a) => a.checkIn),
    ...accommodations.map((a) => a.checkOut),
    ...transports.map((t) => t.departureDateTime),
    ...transports.map((t) => t.arrivalDateTime),
  ].filter((d): d is string => Boolean(d));
}

export function StopCard({
  index,
  stop,
  accommodations,
  transports,
  expenses,
  defaultCurrency,
  timezone,
  addingAccommodation,
  addingTransport,
  onStartAddAccommodation,
  onCancelAddAccommodation,
  onStartAddTransport,
  onCancelAddTransport,
  onAddAccommodation,
  onAddTransport,
  onEditStopName,
  onDeleteStop,
}: StopCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const t = useTranslations("overviewTab");
  const tStats = useTranslations("tripStats");
  const { rates } = useExchangeRates();

  const today = getTodayDate();

  // Per-currency totals for this stop
  const stopCurrencyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    [...accommodations, ...transports, ...expenses].forEach((item) => {
      if (!item.price || item.price <= 0) return;
      totals[item.currency] = (totals[item.currency] || 0) + item.price;
    });
    return totals;
  }, [accommodations, transports, expenses]);

  const stopEstimatedTotal = useMemo(() => {
    return Object.entries(stopCurrencyTotals).reduce(
      (sum, [currency, amount]) =>
        sum + convert(amount, currency, defaultCurrency, rates),
      0,
    );
  }, [stopCurrencyTotals, defaultCurrency, rates]);

  // Compute a date range summary from item dates for display in the stop card header.
  const allItemDates = getAllItemDates(accommodations, transports);

  let dateRangeSummary = "";
  if (allItemDates.length > 0) {
    const sorted = [...allItemDates].sort();
    const earliest = sorted[0].slice(0, 10);
    const latest = sorted[sorted.length - 1].slice(0, 10);
    const earliestYear = earliest.slice(0, 4);
    const latestYear = latest.slice(0, 4);
    if (earliest === latest) {
      dateRangeSummary = format(
        new Date(`${earliest}T00:00:00`),
        "MMM d, yyyy",
      );
    } else if (earliestYear !== latestYear) {
      dateRangeSummary = `${format(new Date(`${earliest}T00:00:00`), "MMM d, yyyy")} – ${format(new Date(`${latest}T00:00:00`), "MMM d, yyyy")}`;
    } else {
      dateRangeSummary = `${format(new Date(`${earliest}T00:00:00`), "MMM d")} – ${format(new Date(`${latest}T00:00:00`), "MMM d")}`;
    }
  }

  // Default date/time for new item forms: use earliest item date or today.
  const defaultDate =
    allItemDates.length > 0 ? allItemDates.sort()[0].slice(0, 10) : today;

  return (
    <Card className="rounded-2xl pb-0 shadow-md">
      <CardHeader className="flex flex-row items-center gap-1 pb-4">
        <div className="flex w-full flex-row items-start gap-2">
          <div className="bg-primary-muted text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif font-semibold">
            {index}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {isEditing ? (
              <form
                className="flex items-center gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editDraft.trim()) return;
                  await onEditStopName(editDraft.trim());
                  setIsEditing(false);
                }}
              >
                <Input
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  className="h-8 px-2 py-1 font-serif text-2xl"
                  maxLength={100}
                  autoFocus
                />
                <Button size="icon-sm" variant="ghost" type="submit">
                  ✓
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  ✕
                </Button>
              </form>
            ) : (
              <>
                <CardTitle className="truncate font-serif text-2xl">
                  {capitalize(stop.name)}
                </CardTitle>
                {dateRangeSummary && (
                  <p className="text-muted-foreground truncate text-sm">
                    {dateRangeSummary}
                  </p>
                )}
              </>
            )}
          </div>
          {!isEditing && (
            <div className="ml-2 flex gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  setEditDraft(stop.name);
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-destructive"
                onClick={async () => {
                  if (
                    confirm(
                      "Delete this stop and all its items? This cannot be undone.",
                    )
                  ) {
                    await onDeleteStop();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="bg-secondary/30 space-y-3 border-t px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-4">
          <section>
            <div className="mt-2 flex flex-col gap-2">
              <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
                <Bed className="text-muted-foreground h-4 w-4" />
                <p>{t("sections.stays")}</p>
              </div>
              {accommodations.length === 0 && (
                <p className="text-muted-foreground">{t("sections.noStays")}</p>
              )}
              {accommodations.map((item) => (
                <Accommodation key={item.id} accommodation={item} />
              ))}
              {addingAccommodation ? (
                <div className="border-border/50 bg-card rounded-xl border p-3">
                  <AccommodationForm
                    initialValues={{
                      name: "",
                      price: 0,
                      currency: defaultCurrency,
                      checkIn: `${defaultDate}T14:00`,
                      checkOut: `${defaultDate}T11:00`,
                      timezone,
                    }}
                    onSubmit={onAddAccommodation}
                    onCancel={onCancelAddAccommodation}
                    submitLabel={t("actions.addStay")}
                    cancelLabel={t("actions.cancel")}
                    autoFocusName
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStartAddAccommodation}
                  className="text-muted-foreground w-fit px-0"
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.addStay")}
                </Button>
              )}
            </div>
          </section>
          <hr/>
          <section>
            <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
              <Plane className="text-muted-foreground h-4 w-4" />
              <p>{t("sections.journeys")}</p>
            </div>
            {transports.length === 0 && (
              <p className="text-muted-foreground">
                {t("sections.noJourneys")}
              </p>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {transports.map((item) => (
                <Transport key={item.id} transport={item} />
              ))}
              {addingTransport ? (
                <div className="border-border/50 bg-card rounded-xl border p-3">
                  <TransportForm
                    initialValues={{
                      name: "",
                      type: "flight",
                      price: 0,
                      currency: defaultCurrency,
                      departureDateTime: `${defaultDate}T12:00`,
                      arrivalDateTime: `${defaultDate}T13:00`,
                      timezone,
                    }}
                    onSubmit={async (data) => {
                      await onAddTransport({
                        name: data.name,
                        price: data.price,
                        currency: data.currency,
                        departureDateTime: data.departureDateTime,
                        arrivalDateTime: data.arrivalDateTime ?? "",
                        timezone: data.timezone,
                      });
                    }}
                    onCancel={onCancelAddTransport}
                    submitLabel={t("actions.addJourney")}
                    cancelLabel={t("actions.cancel")}
                    autoFocusName
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStartAddTransport}
                  className="text-muted-foreground w-fit px-0"
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.addJourney")}
                </Button>
              )}
            </div>
          </section>
          <hr/>
          <section>
            <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase mb-2">
              <CreditCard className="text-muted-foreground h-4 w-4" />
              <p>{t("sections.expenses")}</p>
            </div>
            <Expenses
              stopId={stop.id}
              tripId={stop.tripId}
              expenses={expenses}
              defaultCurrency={defaultCurrency}
            />
          </section>
          {Object.keys(stopCurrencyTotals).length > 0 && (
            <section className="border-t pt-3">
              <div className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-light uppercase">
                {t("sections.stopTotal")}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(stopCurrencyTotals).map(([currency, amount]) => (
                  <span
                    key={currency}
                    className="bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {formatMoney(amount, currency)}
                  </span>
                ))}
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  ≈ {formatMoney(stopEstimatedTotal, defaultCurrency)}
                  <TooltipProvider>
                    <TooltipRoot>
                      <TooltipTrigger
                        className="cursor-default"
                        aria-label={tStats("estimationTooltip")}
                      >
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {tStats("estimationTooltip")}
                      </TooltipContent>
                    </TooltipRoot>
                  </TooltipProvider>
                </span>
              </div>
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useState } from "react";
import { Transport } from "../transport/Transport";
import { useTranslations } from "next-intl";
import { Expenses } from "../expense/Expenses";
import { Input } from "@base-ui/react";
import { Bed, Plus, Plane, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Accommodation } from "../accommodation/Accommodation";
import { AccommodationForm } from "../accommodation/AccommodationForm";
import { TransportForm } from "../transport/TransportForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalize } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useStopDateRange } from "../hooks/useStopDateRange";
import { useStopCostSummary } from "../hooks/useStopCostSummary";

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

  const { dateRangeSummary, defaultDate } = useStopDateRange(
    accommodations,
    transports,
  );
  const { stopCurrencyTotals, stopEstimatedTotal } = useStopCostSummary(
    accommodations,
    transports,
    expenses,
    defaultCurrency,
  );

  return (
    <Card className="rounded-2xl pb-0 shadow-md" data-cy="stop-card">
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
                  data-cy="stop-name-input"
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  className="h-8 px-2 py-1 font-serif text-2xl"
                  maxLength={100}
                  autoFocus
                />
                <Button data-cy="stop-name-save" size="icon-sm" variant="ghost" type="submit">
                  ✓
                </Button>
                <Button
                  data-cy="stop-name-cancel"
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
                <CardTitle data-cy="stop-name" className="truncate font-serif text-2xl">
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
                data-cy="edit-stop-button"
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
                data-cy="delete-stop-button"
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
                  data-cy="add-accommodation-button"
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
                  data-cy="add-transport-button"
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

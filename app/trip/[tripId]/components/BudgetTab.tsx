"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
  TripDocumentType,
} from "@/lib/rxdb-schema";
import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { convert, formatMoney } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/lib/SettingsProvider";
import { useExchangeRates } from "@/lib/useExchangeRates";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import posthog from "posthog-js";

type BudgetTabProps = {
  trip: TripDocumentType;
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expenses: ExpenseDocumentType[];
};

export function BudgetTab({
  trip,
  stops,
  accommodationsByStop,
  transportsByStop,
  expenses,
}: BudgetTabProps) {
  const t = useTranslations("budgetTab");
  const { defaultCurrency } = useSettings();
  const { rates } = useExchangeRates();
  const [budgetValue, setBudgetValue] = useState(String(trip.budget ?? 0));

  useEffect(() => {
    setBudgetValue(String(trip.budget ?? 0));
  }, [trip.budget]);

  const totals = useMemo(() => {
    const allAccommodations = Object.values(accommodationsByStop).flat();
    const allTransports = Object.values(transportsByStop).flat();

    // Per-currency breakdown
    const byCurrency: Record<string, number> = {};
    [...allAccommodations, ...allTransports, ...expenses].forEach((item) => {
      if (!item.price || !item.currency || item.price <= 0) return;
      byCurrency[item.currency] =
        (byCurrency[item.currency] || 0) + item.price;
    });

    const accommodationTotal = allAccommodations.reduce(
      (sum, item) =>
        sum + convert(item.price, item.currency, defaultCurrency, rates),
      0,
    );
    const transportTotal = allTransports.reduce(
      (sum, item) =>
        sum + convert(item.price, item.currency, defaultCurrency, rates),
      0,
    );
    const expensesTotal = expenses.reduce(
      (sum, item) =>
        sum + convert(item.price, item.currency, defaultCurrency, rates),
      0,
    );
    const total = accommodationTotal + transportTotal + expensesTotal;
    return { accommodationTotal, transportTotal, expensesTotal, total, byCurrency };
  }, [accommodationsByStop, defaultCurrency, expenses, transportsByStop, rates]);

  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {
      food: 0,
      activity: 0,
      shopping: 0,
      other: 0,
    };
    for (const expense of expenses) {
      const cat = expense.category ?? "other";
      categories[cat] =
        (categories[cat] ?? 0) +
        convert(expense.price, expense.currency, defaultCurrency, rates);
    }
    return categories;
  }, [expenses, defaultCurrency, rates]);

  const costByStop = useMemo(() => {
    return stops
      .map((stop) => {
        const accTotal = (accommodationsByStop[stop.id] ?? []).reduce(
          (sum, item) =>
            sum + convert(item.price, item.currency, defaultCurrency, rates),
          0,
        );
        const transTotal = (transportsByStop[stop.id] ?? []).reduce(
          (sum, item) =>
            sum + convert(item.price, item.currency, defaultCurrency, rates),
          0,
        );
        const expTotal = expenses
          .filter((e) => e.stopId === stop.id)
          .reduce(
            (sum, item) =>
              sum + convert(item.price, item.currency, defaultCurrency, rates),
            0,
          );
        return { stopId: stop.id, name: stop.name, total: accTotal + transTotal + expTotal };
      })
      .sort((a, b) => b.total - a.total);
  }, [stops, accommodationsByStop, transportsByStop, expenses, defaultCurrency, rates]);

  const numericBudget = Number(budgetValue) || 0;
  const progress =
    numericBudget > 0 ? Math.min(100, (totals.total / numericBudget) * 100) : 0;


  // Debounced updateBudget
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastBudgetValue = useRef<number>(trip.budget ?? 0);

  const updateBudget = (newBudget: number) => {
    setBudgetValue(String(newBudget));
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(async () => {
      if (lastBudgetValue.current !== newBudget) {
        await trip.patch({
          budget: newBudget,
          updatedAt: Date.now(),
        });
        posthog.capture("budget_updated", {
          trip_id: trip.id,
          budget: newBudget,
        });
        lastBudgetValue.current = newBudget;
      }
    }, 500);
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border p-4">
        <p className="text-muted-foreground text-sm">
          {t("tripBudgetLabel", { currency: defaultCurrency })}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            type="number"
            min="0"
            value={budgetValue}
            onChange={(event) => updateBudget(Number(event.target.value) || 0)}
            className="w-36"
          />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Progress value={progress} />
          <div className="flex items-center gap-1.5">
            <p className="text-muted-foreground text-sm">
              ~{formatMoney(totals.total, defaultCurrency)} /{" "}
              {formatMoney(numericBudget, defaultCurrency)}
            </p>
            <TooltipProvider>
              <TooltipRoot>
                <TooltipTrigger
                  className="text-muted-foreground hover:text-foreground cursor-default"
                  aria-label={t("estimationTooltip")}
                >
                  <Info className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>{t("estimationTooltip")}</TooltipContent>
              </TooltipRoot>
            </TooltipProvider>
          </div>
        </div>
      </section>

      {Object.keys(totals.byCurrency).length > 0 && (
        <section className="rounded-2xl border p-4">
          <h3 className="font-serif text-2xl">
            {t("currencyBreakdownTitle")}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(totals.byCurrency).map(([currency, amount]) => (
              <span
                key={currency}
                className="bg-muted rounded-full px-2.5 py-1 text-sm font-medium"
              >
                {formatMoney(amount, currency)}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border p-4">
        <h3 className="font-serif text-2xl">
          {t("categoryBreakdownTitle")}
        </h3>
        <div className="mt-2 flex flex-col gap-1 text-sm">
          <p>
            {t("accommodations")}:{" "}
            ~{formatMoney(totals.accommodationTotal, defaultCurrency)}
          </p>
          <p>
            {t("transports")}: ~{formatMoney(totals.transportTotal, defaultCurrency)}
          </p>
          <p>{t("expenses")}: ~{formatMoney(totals.expensesTotal, defaultCurrency)}</p>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h3 className="font-serif text-2xl">{t("expenseBreakdownTitle")}</h3>
        <div className="mt-2 flex flex-col gap-1 text-sm">
          <p>{t("food")}: ~{formatMoney(expensesByCategory.food, defaultCurrency)}</p>
          <p>{t("activity")}: ~{formatMoney(expensesByCategory.activity, defaultCurrency)}</p>
          <p>{t("shopping")}: ~{formatMoney(expensesByCategory.shopping, defaultCurrency)}</p>
          <p>{t("other")}: ~{formatMoney(expensesByCategory.other, defaultCurrency)}</p>
        </div>
      </section>

      {costByStop.length > 0 && (
        <section className="rounded-2xl border p-4">
          <h3 className="font-serif text-2xl">{t("costByStopTitle")}</h3>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            {costByStop.map((entry) => (
              <p key={entry.stopId}>
                {entry.name}: ~{formatMoney(entry.total, defaultCurrency)}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

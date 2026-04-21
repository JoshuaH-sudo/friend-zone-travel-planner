"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  TransportDocumentType,
  TripDocumentType,
} from "@/lib/rxdb-schema";
import { useEffect, useMemo, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { convert, formatMoney } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/lib/SettingsProvider";
import posthog from "posthog-js";

type BudgetTabProps = {
  trip: TripDocumentType;
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expenses: ExpenseDocumentType[];
};

export function BudgetTab({
  trip,
  accommodationsByStop,
  transportsByStop,
  expenses,
}: BudgetTabProps) {
  const { defaultCurrency } = useSettings();
  const [budgetValue, setBudgetValue] = useState(String(trip.budget ?? 0));

  useEffect(() => {
    setBudgetValue(String(trip.budget ?? 0));
  }, [trip.budget]);

  const totals = useMemo(() => {
    const accommodationTotal = Object.values(accommodationsByStop)
      .flat()
      .reduce(
        (sum, item) =>
          sum + convert(item.price, item.currency, defaultCurrency),
        0,
      );
    const transportTotal = Object.values(transportsByStop)
      .flat()
      .reduce(
        (sum, item) =>
          sum + convert(item.price, item.currency, defaultCurrency),
        0,
      );
    const expensesTotal = expenses.reduce(
      (sum, item) => sum + convert(item.price, item.currency, defaultCurrency),
      0,
    );
    const total = accommodationTotal + transportTotal + expensesTotal;
    return { accommodationTotal, transportTotal, expensesTotal, total };
  }, [accommodationsByStop, defaultCurrency, expenses, transportsByStop]);

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
          Trip budget ({defaultCurrency})
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
          <p className="text-muted-foreground text-sm">
            {formatMoney(totals.total, defaultCurrency)} /{" "}
            {formatMoney(numericBudget, defaultCurrency)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h3 className="font-serif text-2xl">Category breakdown</h3>
        <div className="mt-2 flex flex-col gap-1 text-sm">
          <p>
            Accommodations:{" "}
            {formatMoney(totals.accommodationTotal, defaultCurrency)}
          </p>
          <p>
            Transports: {formatMoney(totals.transportTotal, defaultCurrency)}
          </p>
          <p>Expenses: {formatMoney(totals.expensesTotal, defaultCurrency)}</p>
        </div>
      </section>


    </div>
  );
}

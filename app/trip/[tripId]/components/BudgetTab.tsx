"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
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
        convert(expense.price, expense.currency, defaultCurrency);
    }
    return categories;
  }, [expenses, defaultCurrency]);

  const costByStop = useMemo(() => {
    return stops
      .map((stop) => {
        const accTotal = (accommodationsByStop[stop.id] ?? []).reduce(
          (sum, item) =>
            sum + convert(item.price, item.currency, defaultCurrency),
          0,
        );
        const transTotal = (transportsByStop[stop.id] ?? []).reduce(
          (sum, item) =>
            sum + convert(item.price, item.currency, defaultCurrency),
          0,
        );
        const expTotal = expenses
          .filter((e) => e.stopId === stop.id)
          .reduce(
            (sum, item) =>
              sum + convert(item.price, item.currency, defaultCurrency),
            0,
          );
        return { stopId: stop.id, name: stop.name, total: accTotal + transTotal + expTotal };
      })
      .sort((a, b) => b.total - a.total);
  }, [stops, accommodationsByStop, transportsByStop, expenses, defaultCurrency]);

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

      <section className="rounded-2xl border p-4">
        <h3 className="font-serif text-2xl">Expense breakdown</h3>
        <div className="mt-2 flex flex-col gap-1 text-sm">
          <p>Food: {formatMoney(expensesByCategory.food, defaultCurrency)}</p>
          <p>
            Activity:{" "}
            {formatMoney(expensesByCategory.activity, defaultCurrency)}
          </p>
          <p>
            Shopping:{" "}
            {formatMoney(expensesByCategory.shopping, defaultCurrency)}
          </p>
          <p>Other: {formatMoney(expensesByCategory.other, defaultCurrency)}</p>
        </div>
      </section>

      {costByStop.length > 0 && (
        <section className="rounded-2xl border p-4">
          <h3 className="font-serif text-2xl">Cost by stop</h3>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            {costByStop.map((entry) => (
              <p key={entry.stopId}>
                {entry.name}: {formatMoney(entry.total, defaultCurrency)}
              </p>
            ))}
          </div>
        </section>
      )}


    </div>
  );
}

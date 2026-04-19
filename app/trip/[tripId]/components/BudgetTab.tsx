"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  TransportDocumentType,
  TripDocumentType,
} from "@/lib/rxdb-schema";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { convert, formatMoney } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/lib/SettingsProvider";
import { generateId } from "@/lib/rxdb-database";
import { useDatabase } from "@/lib/DatabaseProvider";

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
  const db = useDatabase();
  const { defaultCurrency } = useSettings();
  const [budgetValue, setBudgetValue] = useState(String(trip.budget ?? 0));
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expensePrice, setExpensePrice] = useState("0");
  const [expenseCurrency, setExpenseCurrency] = useState(defaultCurrency);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setBudgetValue(String(trip.budget ?? 0));
  }, [trip.budget]);

  const totals = useMemo(() => {
    const accommodationTotal = Object.values(accommodationsByStop)
      .flat()
      .reduce(
        (sum, item) => sum + convert(item.price, item.currency, defaultCurrency),
        0,
      );
    const transportTotal = Object.values(transportsByStop)
      .flat()
      .reduce(
        (sum, item) => sum + convert(item.price, item.currency, defaultCurrency),
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
  const progress = numericBudget > 0 ? Math.min(100, (totals.total / numericBudget) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border p-4">
        <p className="text-muted-foreground text-sm">Trip budget ({defaultCurrency})</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            type="number"
            min="0"
            value={budgetValue}
            onChange={(event) => setBudgetValue(event.target.value)}
            className="w-36"
          />
          <Button
            onClick={async () => {
              await trip.patch({
                budget: Number(budgetValue) || 0,
                updatedAt: Date.now(),
              });
            }}
          >
            Save budget
          </Button>
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
          <p>Accommodations: {formatMoney(totals.accommodationTotal, defaultCurrency)}</p>
          <p>Transports: {formatMoney(totals.transportTotal, defaultCurrency)}</p>
          <p>Expenses: {formatMoney(totals.expensesTotal, defaultCurrency)}</p>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h3 className="font-serif text-2xl">Add expense</h3>
        <form
          className="mt-3 flex flex-wrap items-end gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!expenseDescription.trim()) return;
            await db.expenses.insert({
              id: generateId(),
              tripId: trip.id,
              stopId: undefined,
              category: "other",
              description: expenseDescription.trim(),
              price: Number(expensePrice) || 0,
              currency: expenseCurrency,
              date: expenseDate,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            setExpenseDescription("");
            setExpensePrice("0");
          }}
        >
          <Input
            value={expenseDescription}
            onChange={(event) => setExpenseDescription(event.target.value)}
            placeholder="Expense description"
            className="min-w-48 flex-1"
          />
          <Input
            type="number"
            min="0"
            value={expensePrice}
            onChange={(event) => setExpensePrice(event.target.value)}
            className="w-24"
          />
          <CurrencySelect
            name="expenseCurrency"
            value={expenseCurrency}
            onValueChange={(value) => value && setExpenseCurrency(value)}
            currencies="custom"
          />
          <Input
            type="date"
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
          />
          <Button type="submit">Save expense</Button>
        </form>
      </section>
    </div>
  );
}

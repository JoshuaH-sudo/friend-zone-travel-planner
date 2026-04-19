"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input } from "@/components/ui/input";

type StopItemFormProps = {
  placeholder: string;
  defaultDate?: string;
  onSubmit: (payload: {
    name: string;
    price: number;
    currency: string;
    date: string;
    status: "booked" | "planned" | "cancelled";
  }) => Promise<void> | void;
};

export function StopItemForm({
  placeholder,
  defaultDate,
  onSubmit,
}: StopItemFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"booked" | "planned" | "cancelled">(
    "planned",
  );

  return (
    <form
      className="bg-muted/50 flex flex-wrap items-end gap-2 rounded-xl p-3"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim()) return;
        await onSubmit({
          name: name.trim(),
          price: Number(price) || 0,
          currency,
          date,
          status,
        });
        setName("");
        setPrice("0");
      }}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
        className="min-w-40 flex-1"
      />
      <Input
        type="number"
        min="0"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        className="w-24"
      />
      <CurrencySelect
        name="currency"
        value={currency}
        onValueChange={(value) => value && setCurrency(value)}
        currencies="custom"
      />
      <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      <div className="flex items-center gap-1">
        {(["booked", "planned", "cancelled"] as const).map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={status === value ? "default" : "outline"}
            onClick={() => setStatus(value)}
            className="capitalize"
          >
            {value}
          </Button>
        ))}
      </div>
      <Button type="submit" size="sm">
        Add
      </Button>
    </form>
  );
}

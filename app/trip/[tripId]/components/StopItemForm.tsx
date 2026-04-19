"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StopItemFormProps = {
  kind: "stop" | "accommodation" | "transport";
  placeholder: string;
  defaultDate?: string;
  onSubmit: (payload: {
    name: string;
    price: number;
    currency: string;
    date?: string;
    startDateTime?: string;
    endDateTime?: string;
    status: "booked" | "planned" | "cancelled";
  }) => Promise<void> | void;
};

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10);
}

function toDateTimeLocal(value: string | undefined, fallbackTime: string) {
  const date = value && value.length >= 10 ? value.slice(0, 10) : getDefaultDate();
  return `${date}T${fallbackTime}`;
}

export function StopItemForm({
  kind,
  placeholder,
  defaultDate,
  onSubmit,
}: StopItemFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState(defaultDate ?? getDefaultDate());
  const [startDateTime, setStartDateTime] = useState(
    toDateTimeLocal(defaultDate, kind === "accommodation" ? "14:00" : "12:00"),
  );
  const [endDateTime, setEndDateTime] = useState(
    toDateTimeLocal(defaultDate, kind === "accommodation" ? "11:00" : "13:00"),
  );
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
          date: kind === "stop" ? date : undefined,
          startDateTime: kind === "stop" ? undefined : startDateTime,
          endDateTime: kind === "stop" ? undefined : endDateTime,
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
      {kind === "stop" ? (
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">
              {kind === "accommodation" ? "Check-in" : "Departure"}
            </Label>
            <Input
              type="datetime-local"
              value={startDateTime}
              onChange={(event) => setStartDateTime(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">
              {kind === "accommodation" ? "Check-out" : "Arrival"}
            </Label>
            <Input
              type="datetime-local"
              value={endDateTime}
              onChange={(event) => setEndDateTime(event.target.value)}
            />
          </div>
        </div>
      )}
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

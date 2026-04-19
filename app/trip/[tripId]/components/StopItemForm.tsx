"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type StopItemFormProps = {
  kind: "stop" | "accommodation" | "transport";
  placeholder: string;
  defaultDate?: string;
  stopBottomLayout?: boolean;
  onSubmit: (payload: {
    name: string;
    price: number;
    currency: string;
    date?: string;
    startDateTime?: string;
    endDateTime?: string;
  }) => Promise<void> | void;
};

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10);
}

function getInitialDate(
  kind: "stop" | "accommodation" | "transport",
  defaultDate?: string,
  stopBottomLayout?: boolean,
) {
  if (defaultDate) {
    return defaultDate;
  }
  if (kind === "stop" && stopBottomLayout) {
    return "";
  }
  return getDefaultDate();
}

function toDateTimeLocal(value: string | undefined, fallbackTime: string) {
  const date = value && value.length >= 10 ? value.slice(0, 10) : getDefaultDate();
  return `${date}T${fallbackTime}`;
}

export function StopItemForm({
  kind,
  placeholder,
  defaultDate,
  stopBottomLayout = false,
  onSubmit,
}: StopItemFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState(getInitialDate(kind, defaultDate, stopBottomLayout));
  const [startDateTime, setStartDateTime] = useState(
    toDateTimeLocal(defaultDate, kind === "accommodation" ? "14:00" : "12:00"),
  );
  const [endDateTime, setEndDateTime] = useState(
    toDateTimeLocal(defaultDate, kind === "accommodation" ? "11:00" : "13:00"),
  );

  return (
    <form
      className={
        stopBottomLayout
          ? "bg-muted/30 flex flex-wrap items-center gap-2 rounded-2xl border p-3"
          : "bg-muted/50 flex flex-wrap items-end gap-2 rounded-xl p-3"
      }
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
        });
        setName("");
        setPrice("0");
        if (kind === "stop") {
          setDate(getInitialDate(kind, defaultDate, stopBottomLayout));
        }
      }}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
        className={cn("min-w-40 flex-1", stopBottomLayout && "min-w-56 rounded-xl bg-white/80")}
      />
      {kind !== "stop" ? (
        <>
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
        </>
      ) : null}
      {kind === "stop" ? (
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={cn(stopBottomLayout && "w-40 rounded-xl bg-white/80")}
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
      <Button
        type="submit"
        size="sm"
        className={
          stopBottomLayout
            ? "h-10 rounded-xl bg-emerald-900 px-4 text-white hover:bg-emerald-800"
            : undefined
        }
      >
        {stopBottomLayout ? <Plus className="mr-2 h-4 w-4" /> : null}
        {kind === "stop" ? "Add stop" : "Add"}
      </Button>
    </form>
  );
}

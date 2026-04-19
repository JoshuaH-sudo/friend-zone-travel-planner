"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea, ScrollAreaScrollbar } from "@/components/ui/scroll-area";
import { MS_PER_DAY } from "@/lib/constants/time";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

/** Parse an ISO date or datetime string into a Date.
 * Parses in local time to avoid UTC midnight shifts.
 */
function parseIsoString(value: string): Date {
  if (value.includes("T")) {
    const [datePart, timePart] = value.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, min] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, h, min, 0, 0);
  }
  const [y, m, d] = value.split("-").map(Number);
  // Default to noon when no time is specified
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Format a Date to "YYYY-MM-DDTHH:MM" */
function toIsoDateTimeString(date: Date): string {
  const y = date.getFullYear().toString().padStart(4, "0");
  const mo = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const mi = date.getMinutes().toString().padStart(2, "0");
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

export interface DateTimePickerProps {
  /** ISO date string "YYYY-MM-DD" or datetime string "YYYY-MM-DDTHH:MM" */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  highlightedDates?: string[];
  pairedHighlightDate?: string;
  presets?: Array<{ label: string; date: Date }>;
}

const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59
export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  className,
  highlightedDates,
  pairedHighlightDate,
  presets,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Derive Date from the controlled string value
  const date = React.useMemo(
    () => (value ? parseIsoString(value) : undefined),
    [value],
  );
  const highlightedDays = React.useMemo(
    () =>
      [...new Set(highlightedDates ?? [])]
        .filter(Boolean)
        .map((highlightedDate) => parseIsoString(highlightedDate)),
    [highlightedDates],
  );
  const pairedDay = React.useMemo(
    () =>
      pairedHighlightDate ? parseIsoString(pairedHighlightDate) : undefined,
    [pairedHighlightDate],
  );
  const datePresets = React.useMemo(
    () =>
      presets ?? [
        { label: "Today", date: new Date() },
        { label: "Tomorrow", date: new Date(Date.now() + MS_PER_DAY) },
        {
          label: "In 7 days",
          date: new Date(Date.now() + 7 * MS_PER_DAY),
        },
      ],
    [presets],
  );

  const applyPreset = (presetDate: Date) => {
    const h = date ? date.getHours() : 12;
    const m = date ? date.getMinutes() : 0;
    const merged = new Date(
      presetDate.getFullYear(),
      presetDate.getMonth(),
      presetDate.getDate(),
      h,
      m,
      0,
      0,
    );
    onChange(toIsoDateTimeString(merged));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    // Preserve existing hour/minute if a date was already selected
    const h = date ? date.getHours() : 12;
    const m = date ? date.getMinutes() : 0;
    const merged = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      h,
      m,
      0,
      0,
    );
    onChange(toIsoDateTimeString(merged));
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    rawValue: string,
  ) => {
    if (!date) return;
    const newDate = new Date(date);

    if (type === "hour") {
      const h = parseInt(rawValue, 10) % 12; // 0-11
      const isPm = newDate.getHours() >= 12;
      newDate.setHours(h + (isPm ? 12 : 0));
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(rawValue, 10));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      if (rawValue === "PM" && currentHours < 12) {
        newDate.setHours(currentHours + 12);
      } else if (rawValue === "AM" && currentHours >= 12) {
        newDate.setHours(currentHours - 12);
      }
    }

    onChange(toIsoDateTimeString(newDate));
  };

  // Derive 12-hour display values
  const display12Hour = date ? date.getHours() % 12 || 12 : 12;
  const displayMinute = date ? date.getMinutes() : 0;
  const displayAmPm = date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM";

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        {value && date ? (
          format(date, "MM/dd/yyyy hh:mm aa")
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="border-b p-2">
          <div className="flex flex-wrap gap-1">
            {datePresets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset.date)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date(2100, 11)}
            initialFocus
            modifiers={{
              highlighted: highlightedDays,
              paired: pairedDay ? [pairedDay] : undefined,
            }}
            modifiersClassNames={{
              highlighted: "bg-muted text-muted-foreground",
              paired: "ring-1 ring-primary/60",
            }}
          />
          {/* Time selectors — only usable after a date is chosen */}
          <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
            {/* Hours */}
            <ScrollArea className="w-16 sm:h-full">
              <div className="flex flex-col gap-1 p-2">
                {hours.map((h) => (
                  <Button
                    key={h}
                    size="icon"
                    variant={display12Hour === h && date ? "default" : "ghost"}
                    className="aspect-square w-full shrink-0 text-sm"
                    onClick={() => handleTimeChange("hour", String(h))}
                    disabled={!date}
                    type="button"
                  >
                    {h}
                  </Button>
                ))}
              </div>
              <ScrollAreaScrollbar orientation="vertical" />
            </ScrollArea>
            {/* Minutes */}
            <ScrollArea className="w-16 sm:h-full">
              <div className="flex flex-col gap-1 p-2">
                {minutes.map((m) => (
                  <Button
                    key={m}
                    size="icon"
                    variant={displayMinute === m && date ? "default" : "ghost"}
                    className="aspect-square w-full shrink-0 text-sm"
                    onClick={() => handleTimeChange("minute", String(m))}
                    disabled={!date}
                    type="button"
                  >
                    {m.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollAreaScrollbar orientation="vertical" />
            </ScrollArea>
            {/* AM / PM */}
            <div className="flex flex-col gap-1 p-2">
              {(["AM", "PM"] as const).map((period) => (
                <Button
                  key={period}
                  size="icon"
                  variant={displayAmPm === period && date ? "default" : "ghost"}
                  className="aspect-square w-full shrink-0 text-sm"
                  onClick={() => handleTimeChange("ampm", period)}
                  disabled={!date}
                  type="button"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}

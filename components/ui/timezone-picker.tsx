"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

function getUtcOffset(tz: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(new Date());
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value ?? "UTC+0";
  } catch {
    return "UTC+0";
  }
}

function getCurrentTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    return "";
  }
}

/** Numeric UTC offset in minutes, used for stable sorting. */
function getOffsetMinutes(tz: string): number {
  try {
    // Intl.DateTimeFormat with timeZoneName:"shortOffset" gives e.g. "GMT+5:30"
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(new Date());
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    const match = raw.match(/([+-])(\d{1,2}):?(\d{2})?/);
    if (!match) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3] ?? "0", 10);
    return sign * (hours * 60 + minutes);
  } catch {
    return 0;
  }
}

/** Extract the region prefix from a timezone string (e.g. "America/New_York" → "America"). */
function getRegion(tz: string): string {
  return tz.includes("/") ? tz.split("/")[0] : "Other";
}

const REGION_ORDER = [
  "Africa",
  "America",
  "Antarctica",
  "Arctic",
  "Asia",
  "Atlantic",
  "Australia",
  "Europe",
  "Indian",
  "Pacific",
  "UTC",
  "Other",
];

// ── types ────────────────────────────────────────────────────────────────────

interface TimezoneEntry {
  tz: string;
  label: string;
  region: string;
  offset: string;
  offsetMinutes: number;
}

// Pre-compute all timezone entries (except current time, which is refreshed on open).
const ALL_TIMEZONES: Omit<TimezoneEntry, "currentTime">[] = (() => {
  const zones: string[] = Intl.supportedValuesOf("timeZone");
  return zones
    .map((tz) => ({
      tz,
      label: tz.replace(/_/g, " "),
      region: getRegion(tz),
      offset: getUtcOffset(tz),
      offsetMinutes: getOffsetMinutes(tz),
    }))
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.tz.localeCompare(b.tz));
})();

// ── component ─────────────────────────────────────────────────────────────────

interface TimezonePickerProps {
  /** Currently selected IANA timezone string. */
  value: string;
  /** Called with the new IANA timezone string when the user picks one. */
  onValueChange: (tz: string) => void;
  /** Optional CSS class for the trigger button. */
  className?: string;
}

export function TimezonePicker({
  value,
  onValueChange,
  className,
}: TimezonePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Compute current times for all zones once when the dialog opens.
  const currentTimes = useMemo(() => {
    if (!open) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const entry of ALL_TIMEZONES) {
      map[entry.tz] = getCurrentTime(entry.tz);
    }
    return map;
  }, [open]);

  const handleSelect = useCallback(
    (tz: string) => {
      onValueChange(tz);
      setOpen(false);
      setQuery("");
    },
    [onValueChange],
  );

  const handleAutoDetect = useCallback(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      handleSelect(detected);
    } catch {
      // ignore
    }
  }, [handleSelect]);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_TIMEZONES;
    const q = query.toLowerCase();
    return ALL_TIMEZONES.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.offset.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimezoneEntry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.region) ?? [];
      list.push(entry);
      map.set(entry.region, list);
    }
    // Sort groups by REGION_ORDER
    return [...map.entries()].sort(([a], [b]) => {
      const ai = REGION_ORDER.indexOf(a);
      const bi = REGION_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [filtered]);

  // Display label for the trigger button
  const displayLabel = useMemo(() => {
    const entry = ALL_TIMEZONES.find((e) => e.tz === value);
    return entry ? `${entry.label} (${entry.offset})` : value;
  }, [value]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Pick timezone"
        className={cn(
          "border-input data-placeholder:text-muted-foreground bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 gap-1.5 rounded-4xl border px-3 py-2 text-sm transition-colors focus-visible:ring-[3px] h-9 flex items-center whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 min-w-0 truncate",
          className,
        )}
      >
        <span className="truncate">{displayLabel}</span>
      </button>

      <DialogContent className="max-w-sm sm:max-w-lg flex flex-col gap-4 p-6">
        <DialogHeader>
          <DialogTitle>Select Timezone</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search timezones…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoDetect}
            className="shrink-0"
          >
            Auto-detect
          </Button>
        </div>

        <ScrollArea className="h-72 rounded-2xl border">
          <div className="p-2">
            {grouped.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No timezones found.
              </p>
            )}
            {grouped.map(([region, entries]) => (
              <div key={region}>
                <h3 className="text-muted-foreground bg-background sticky top-0 px-2 py-1.5 text-xs font-semibold tracking-wide uppercase">
                  {region}
                </h3>
                {entries.map((entry) => (
                  <button
                    key={entry.tz}
                    type="button"
                    onClick={() => handleSelect(entry.tz)}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-sm transition-colors",
                      entry.tz === value && "bg-accent text-accent-foreground",
                    )}
                  >
                    <span className="flex-1 truncate text-left">
                      {entry.label}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {entry.offset}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {currentTimes[entry.tz] ?? ""}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

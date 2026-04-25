"use client";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getStoredDateTimeTimestamp,
  parseStoredDateTime,
} from "@/lib/datetime-utils";
import {
  useTripData,
  type UseTripDataResult,
} from "@/components/hooks/useTripData";
import { convert, formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/SettingsProvider";
import { useExchangeRates } from "@/lib/useExchangeRates";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const toStartTimestamp = (value: string) =>
  getStoredDateTimeTimestamp(value, { dateOnlyBoundary: "start" });
const toEndTimestamp = (value: string) =>
  getStoredDateTimeTimestamp(value, { dateOnlyBoundary: "end" });
const toStoredDatePart = (value: string) =>
  value.includes("T") ? value.split("T")[0] : value;

export function TripStats({
  tripId,
  tripData,
}: {
  tripId: string;
  tripData?: UseTripDataResult;
}) {
  const t = useTranslations("tripStats");
  const locale = useLocale();
  const { defaultCurrency } = useSettings();
  const { rates } = useExchangeRates();
  const internalTripData = useTripData(tripId, { enabled: !tripData });
  const resolvedTripData = tripData ?? internalTripData;
  const { trip, stops, accommodationsByStop, transportsByStop, expenses } =
    resolvedTripData;

  const formatDate = (value: string) => {
    const parsed = parseStoredDateTime(value) ?? new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString(locale);
  };

  const stats = useMemo(() => {
    const currencyTotals: Record<string, number> = {};
    let stopCount = 0;
    let accommodationCount = 0;
    let transportCount = 0;
    let startDate: string | null = null;
    let endDate: string | null = null;
    let totalDays = 0;
    let startTimestamp: number | null = null;
    let endTimestamp: number | null = null;

    if (!trip) {
      return {
        currencyTotals,
        estimatedTotal: 0,
        stopCount,
        accommodationCount,
        transportCount,
        startDate,
        endDate,
        totalDays,
      };
    }

    stops.forEach((stop) => {
      stopCount++;
      const stopItemDates = [
        ...(accommodationsByStop[stop.id] || []).flatMap((acc) => [
          acc.checkIn,
          acc.checkOut,
        ]),
        ...(transportsByStop[stop.id] || []).flatMap((trans) => [
          trans.departureDateTime,
          ...(trans.arrivalDateTime ? [trans.arrivalDateTime] : []),
        ]),
      ].filter((value): value is string => Boolean(value));
      const stopBounds = [...stopItemDates]
        .filter((value): value is string => Boolean(value))
        .map((value) => ({
          value,
          startTimestamp: toStartTimestamp(value),
          endTimestamp: toEndTimestamp(value),
        }));
      if (stopBounds.length === 0) {
        return;
      }
      const stopStartEntry = stopBounds.reduce(
        (earliest, current) =>
          current.startTimestamp < earliest.startTimestamp ? current : earliest,
        stopBounds[0],
      );
      const stopEndEntry = stopBounds.reduce(
        (latest, current) =>
          current.endTimestamp > latest.endTimestamp ? current : latest,
        stopBounds[0],
      );
      const stopStartTimestamp = stopStartEntry.startTimestamp;
      const stopEndTimestamp = stopEndEntry.endTimestamp;
      if (startTimestamp === null || stopStartTimestamp < startTimestamp) {
        startTimestamp = stopStartTimestamp;
        startDate = stopStartEntry.value;
      }
      if (endTimestamp === null || stopEndTimestamp > endTimestamp) {
        endTimestamp = stopEndTimestamp;
        endDate = stopEndEntry.value;
      }

      (accommodationsByStop[stop.id] || []).forEach((acc) => {
        accommodationCount++;
        if (!acc.price || !acc.currency || acc.price <= 0) return;
        currencyTotals[acc.currency] =
          (currencyTotals[acc.currency] || 0) + acc.price;
      });

      (transportsByStop[stop.id] || []).forEach((trans) => {
        transportCount++;
        if (!trans.price || !trans.currency || trans.price <= 0) return;
        currencyTotals[trans.currency] =
          (currencyTotals[trans.currency] || 0) + trans.price;
      });
    });

    // Include expenses in per-currency totals
    (expenses || []).forEach((expense) => {
      if (!expense.price || !expense.currency || expense.price <= 0) return;
      currencyTotals[expense.currency] =
        (currencyTotals[expense.currency] || 0) + expense.price;
    });

    const startDay = startDate ? toStoredDatePart(startDate) : null;
    const endDay = endDate ? toStoredDatePart(endDate) : null;
    totalDays =
      startDay && endDay
        ? (toStartTimestamp(endDay) - toStartTimestamp(startDay)) /
            (1000 * 60 * 60 * 24) +
          1
        : 0;
    totalDays = Math.max(0, Math.round(totalDays));

    // Estimated grand total in user's preferred currency
    const estimatedTotal = Object.entries(currencyTotals).reduce(
      (sum, [currency, amount]) =>
        sum + convert(amount, currency, defaultCurrency, rates),
      0,
    );

    return {
      currencyTotals,
      estimatedTotal,
      stopCount,
      accommodationCount,
      transportCount,
      startDate,
      endDate,
      totalDays,
    };
  }, [
    trip,
    stops,
    accommodationsByStop,
    transportsByStop,
    expenses,
    defaultCurrency,
    rates,
  ]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {t("destinations", { count: stats.stopCount })}
          </Badge>
          <Badge variant="secondary">
            {t("accommodations", { count: stats.accommodationCount })}
          </Badge>
          <Badge variant="secondary">
            {t("transports", { count: stats.transportCount })}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{t("durationLabel")}</span>
            <span className="text-muted-foreground">
              {stats.startDate ? formatDate(stats.startDate) : t("notAvailable")}{" "}
              → {stats.endDate ? formatDate(stats.endDate) : t("notAvailable")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{t("daysLabel")}</span>
            <span className="text-muted-foreground">{stats.totalDays}</span>
          </div>
        </div>

        {Object.keys(stats.currencyTotals).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("totalCostLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.currencyTotals).map(([currency, total]) => (
                <Badge key={currency} variant="outline">
                  {currency}: {total.toFixed(2)}
                </Badge>
              ))}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-muted-foreground text-sm">
                {t("estimatedTotal")}:{" "}
                <span className="text-foreground font-medium">
                  ~{formatMoney(stats.estimatedTotal, defaultCurrency)}
                </span>
              </span>
              <TooltipProvider>
                <TooltipRoot>
                  <TooltipTrigger
                    className="text-muted-foreground hover:text-foreground cursor-default"
                    aria-label={t("estimationTooltip")}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("estimationTooltip")}
                  </TooltipContent>
                </TooltipRoot>
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

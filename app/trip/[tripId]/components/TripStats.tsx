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

export function TripStats({
  tripId,
  tripData,
}: {
  tripId: string;
  tripData?: UseTripDataResult;
}) {
  const t = useTranslations("tripStats");
  const locale = useLocale();
  const internalTripData = useTripData(tripId, { enabled: !tripData });
  const resolvedTripData = tripData ?? internalTripData;
  const { trip, stops, accommodationsByStop, transportsByStop } =
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
          trans.arrivalDateTime || trans.departureDateTime,
        ]),
      ].filter(Boolean);
      const stopStart = stopItemDates.reduce(
        (earliest, current) =>
          getStoredDateTimeTimestamp(current, {
            dateOnlyBoundary: "start",
          }) <
          getStoredDateTimeTimestamp(earliest, {
            dateOnlyBoundary: "start",
          })
            ? current
            : earliest,
        stop.date,
      );
      const stopEnd = stopItemDates.reduce(
        (latest, current) =>
          getStoredDateTimeTimestamp(current, { dateOnlyBoundary: "end" }) >
          getStoredDateTimeTimestamp(latest, { dateOnlyBoundary: "end" })
            ? current
            : latest,
        stop.date,
      );
      const stopStartTimestamp = getStoredDateTimeTimestamp(stopStart, {
        dateOnlyBoundary: "start",
      });
      const stopEndTimestamp = getStoredDateTimeTimestamp(stopEnd, {
        dateOnlyBoundary: "end",
      });
      if (startTimestamp === null || stopStartTimestamp < startTimestamp) {
        startTimestamp = stopStartTimestamp;
        startDate = stopStart;
      }
      if (endTimestamp === null || stopEndTimestamp > endTimestamp) {
        endTimestamp = stopEndTimestamp;
        endDate = stopEnd;
      }

      (accommodationsByStop[stop.id] || []).forEach((acc) => {
        accommodationCount++;
        currencyTotals[acc.currency] =
          (currencyTotals[acc.currency] || 0) + acc.price;
      });

      (transportsByStop[stop.id] || []).forEach((trans) => {
        transportCount++;
        currencyTotals[trans.currency] =
          (currencyTotals[trans.currency] || 0) + trans.price;
      });
    });

    const startDay = startDate ? startDate.split("T")[0] : null;
    const endDay = endDate ? endDate.split("T")[0] : null;
    totalDays =
      startDay && endDay
        ? (getStoredDateTimeTimestamp(endDay, { dateOnlyBoundary: "start" }) -
            getStoredDateTimeTimestamp(startDay, { dateOnlyBoundary: "start" })) /
            (1000 * 60 * 60 * 24) +
          1
        : 0;
    totalDays = Math.max(0, Math.round(totalDays));

    return {
      currencyTotals,
      stopCount,
      accommodationCount,
      transportCount,
      startDate,
      endDate,
      totalDays,
    };
  }, [trip, stops, accommodationsByStop, transportsByStop]);

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
              {stats.startDate
                ? formatDate(stats.startDate)
                : t("notAvailable")}{" "}
              →{" "}
              {stats.endDate
                ? formatDate(stats.endDate)
                : t("notAvailable")}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

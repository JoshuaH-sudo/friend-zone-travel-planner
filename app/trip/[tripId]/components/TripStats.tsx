"use client";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const stats = useMemo(() => {
    const currencyTotals: Record<string, number> = {};
    let stopCount = 0;
    let accommodationCount = 0;
    let transportCount = 0;
    let startDate: string | null = null;
    let endDate: string | null = null;
    let totalDays = 0;

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

      if (!startDate || stop.date < startDate) {
        startDate = stop.date;
      }
      if (!endDate || stop.date > endDate) {
        endDate = stop.date;
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

    totalDays =
      startDate && endDate
        ? (new Date(endDate).getTime() - new Date(startDate).getTime()) /
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
                ? new Date(stats.startDate).toLocaleDateString(locale)
                : t("notAvailable")}{" "}
              →{" "}
              {stats.endDate
                ? new Date(stats.endDate).toLocaleDateString(locale)
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

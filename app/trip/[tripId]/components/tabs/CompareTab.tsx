"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AccommodationDocumentType,
  ExpenseDocumentType,
  RouteCompareWeights,
  RouteDocumentType,
  RouteStopDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { buildRouteMetrics } from "@/lib/routes/metrics";
import { useTranslations } from "next-intl";

type CompareTabProps = {
  routes: RouteDocumentType[];
  routeStops: RouteStopDocumentType[];
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expensesByStop: Record<string, ExpenseDocumentType[]>;
  weights: RouteCompareWeights;
  activeRouteId: string;
  onActivateRoute: (routeId: string) => Promise<void>;
};

export function CompareTab({
  routes,
  routeStops,
  stops,
  accommodationsByStop,
  transportsByStop,
  expensesByStop,
  weights,
  activeRouteId,
  onActivateRoute,
}: CompareTabProps) {
  const t = useTranslations("compareTab");
  if (routes.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center">
        {t("empty")}
      </p>
    );
  }

  const metrics = buildRouteMetrics({
    routes,
    routeStops,
    stops,
    accommodationsByStop,
    transportsByStop,
    expensesByStop,
    weights,
  });

  const best = metrics[0];

  return (
    <div className="grid gap-3">
      {metrics.map((metric) => {
        const scorePercent = best?.score
          ? (metric.score / best.score) * 100
          : 0;
        const isActive = metric.route.id === activeRouteId;
        return (
          <section
            key={metric.route.id}
            className="space-y-2 rounded-2xl border p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: metric.route.color }}
                />
                {metric.route.name}
              </h3>
              <Button
                size="sm"
                variant={isActive ? "secondary" : "default"}
                disabled={isActive}
                onClick={() => onActivateRoute(metric.route.id)}
              >
                {isActive ? t("activeRoute") : t("activate")}
              </Button>
            </div>

            <Progress value={scorePercent} />
            <p className="text-muted-foreground text-sm">
              {t("score", { value: metric.score.toFixed(2) })}
            </p>

            <div className="grid gap-1 text-sm sm:grid-cols-2">
              <p>{t("stops", { count: metric.stopCount })}</p>
              <p>{t("travelSegments", { count: metric.travelSegments })}</p>
              <p>{t("totalCost", { value: metric.totalCost.toFixed(2) })}</p>
              <p>{t("events", { count: metric.eventCount })}</p>
            </div>
          </section>
        );
      })}
    </div>
  );
}

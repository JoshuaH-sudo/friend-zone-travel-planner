import {
  AccommodationDocumentType,
  ExpenseDocumentType,
  RouteCompareWeights,
  RouteDocumentType,
  RouteStopDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { normalizeRouteCompareWeights } from "@/lib/routes/constants";

export type RouteMetrics = {
  route: RouteDocumentType;
  totalCost: number;
  stopCount: number;
  travelSegments: number;
  eventCount: number;
  totalDays: number;
  score: number;
};

function normalizeScore(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

function inverseScore(value: number, max: number): number {
  if (max <= 0) return 0.5;
  return 1 - normalizeScore(value, max);
}

function directScore(value: number, max: number): number {
  if (max <= 0) return 0.5;
  return normalizeScore(value, max);
}

export function buildRouteMetrics(params: {
  routes: RouteDocumentType[];
  routeStops: RouteStopDocumentType[];
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expensesByStop: Record<string, ExpenseDocumentType[]>;
  weights: RouteCompareWeights;
}): RouteMetrics[] {
  const {
    routes,
    routeStops,
    stops,
    accommodationsByStop,
    transportsByStop,
    expensesByStop,
    weights: rawWeights,
  } = params;
  const weights = normalizeRouteCompareWeights(rawWeights);

  const routeStopsByRoute = new Map<string, RouteStopDocumentType[]>();
  for (const routeStop of routeStops) {
    const current = routeStopsByRoute.get(routeStop.routeId) ?? [];
    current.push(routeStop);
    routeStopsByRoute.set(routeStop.routeId, current);
  }

  const stopsByRoute = new Map<string, StopDocumentType[]>();
  for (const stop of stops) {
    if (!stop.routeId) continue;
    const current = stopsByRoute.get(stop.routeId) ?? [];
    current.push(stop);
    stopsByRoute.set(stop.routeId, current);
  }

  const base = routes.map((route) => {
    const currentStops = stopsByRoute.get(route.id) ?? [];
    const routeStopList = routeStopsByRoute.get(route.id) ?? [];

    let totalCost = 0;
    let travelSegments = 0;
    for (const stop of currentStops) {
      const accommodations = accommodationsByStop[stop.id] ?? [];
      const transports = transportsByStop[stop.id] ?? [];
      const expenses = expensesByStop[stop.id] ?? [];
      totalCost += [...accommodations, ...transports, ...expenses].reduce(
        (sum, item) => sum + item.price,
        0,
      );
      travelSegments += transports.length;
    }

    const datedStops = routeStopList.filter(
      (stop) => Boolean(stop.startDate) && Boolean(stop.endDate),
    );
    const totalDays = datedStops.reduce((sum, stop) => {
      if (!stop.startDate || !stop.endDate) return sum;
      const start = new Date(`${stop.startDate}T00:00:00`).getTime();
      const end = new Date(`${stop.endDate}T00:00:00`).getTime();
      const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return sum + Math.max(0, diff);
    }, 0);

    const eventCount = routeStopList.reduce(
      (sum, stop) => sum + (stop.intel?.items.length ?? 0),
      0,
    );

    return {
      route,
      totalCost,
      stopCount: routeStopList.length || currentStops.length,
      travelSegments,
      eventCount,
      totalDays,
      score: 0,
    };
  });

  const maxCost = Math.max(0, ...base.map((entry) => entry.totalCost));
  const maxDays = Math.max(0, ...base.map((entry) => entry.totalDays));
  const maxTravel = Math.max(0, ...base.map((entry) => entry.travelSegments));
  const maxEvents = Math.max(0, ...base.map((entry) => entry.eventCount));

  return base
    .map((entry) => {
      const costScore = inverseScore(entry.totalCost, maxCost);
      const durationScore = inverseScore(entry.totalDays, maxDays);
      const travelScore = inverseScore(entry.travelSegments, maxTravel);
      const eventScore = directScore(entry.eventCount, maxEvents);

      const score =
        costScore * weights.cost +
        durationScore * weights.duration +
        travelScore * weights.travel +
        eventScore * weights.events;

      return { ...entry, score };
    })
    .sort((a, b) => b.score - a.score);
}

import { RouteCompareWeights } from "@/lib/rxdb-schema";

export const ROUTE_COLORS = [
  "#2d6a4f",
  "#3a86ff",
  "#8338ec",
  "#ff006e",
  "#fb8500",
] as const;

export const DEFAULT_ROUTE_COMPARE_WEIGHTS: RouteCompareWeights = {
  cost: 0.35,
  duration: 0.25,
  travel: 0.2,
  events: 0.2,
};

export const ROUTE_STOP_INTEL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function normalizeRouteCompareWeights(
  weights: RouteCompareWeights,
): RouteCompareWeights {
  const safe = {
    cost: Math.max(0, weights.cost),
    duration: Math.max(0, weights.duration),
    travel: Math.max(0, weights.travel),
    events: Math.max(0, weights.events),
  };
  const total = safe.cost + safe.duration + safe.travel + safe.events;
  if (total <= 0) {
    return DEFAULT_ROUTE_COMPARE_WEIGHTS;
  }
  return {
    cost: safe.cost / total,
    duration: safe.duration / total,
    travel: safe.travel / total,
    events: safe.events / total,
  };
}

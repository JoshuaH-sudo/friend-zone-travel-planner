import { MyDatabase, generateId } from "@/lib/rxdb-database";
import {
  RouteCompareWeights,
  RouteDocumentType,
  RouteStopDocumentType,
  TripDocumentType,
} from "@/lib/rxdb-schema";
import {
  DEFAULT_ROUTE_COMPARE_WEIGHTS,
  ROUTE_COLORS,
} from "@/lib/routes/constants";

async function getTrip(
  db: MyDatabase,
  tripId: string,
): Promise<TripDocumentType> {
  const trip = await db.trips.findOne(tripId).exec();
  if (!trip) {
    throw new Error("Trip not found");
  }
  return trip;
}

export async function ensureTripBootstrapped(
  db: MyDatabase,
  tripId: string,
): Promise<{ activeRouteId: string; routes: RouteDocumentType[] }> {
  const trip = await getTrip(db, tripId);
  let routes = await db.routes
    .find({ selector: { tripId } })
    .sort({ createdAt: "asc", id: "asc" })
    .exec();

  if (routes.length === 0) {
    const now = Date.now();
    const routeId = generateId();
    const route = await db.routes.insert({
      id: routeId,
      tripId,
      name: "Route 1",
      color: ROUTE_COLORS[0],
      createdAt: now,
      updatedAt: now,
    });
    routes = [route];
  }

  const activeRouteId =
    trip.activeRouteId &&
    routes.some((route) => route.id === trip.activeRouteId)
      ? trip.activeRouteId
      : routes[0].id;

  if (trip.activeRouteId !== activeRouteId || !trip.status) {
    await trip.patch({
      activeRouteId,
      status: trip.status ?? "planning",
      updatedAt: Date.now(),
    });
  }

  const tripStops = await db.stops
    .find({ selector: { tripId } })
    .sort({ createdAt: "asc", id: "asc" })
    .exec();

  await Promise.all(
    tripStops
      .filter((stop) => !stop.routeId)
      .map((stop) =>
        stop.patch({
          routeId: activeRouteId,
          updatedAt: Date.now(),
        }),
      ),
  );

  const routeStops = await db.route_stops
    .find({ selector: { tripId, routeId: activeRouteId } })
    .sort({ order: "asc", createdAt: "asc", id: "asc" })
    .exec();

  if (routeStops.length === 0) {
    const seededStops = tripStops.filter(
      (stop) => (stop.routeId ?? activeRouteId) === activeRouteId,
    );
    await Promise.all(
      seededStops.map((stop, index) =>
        db.route_stops.insert({
          id: generateId(),
          tripId,
          routeId: activeRouteId,
          name: stop.name,
          order: index,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ),
    );
  }

  await syncRouteToStops(db, tripId, activeRouteId);

  const syncedRoutes = await db.routes
    .find({ selector: { tripId } })
    .sort({ createdAt: "asc", id: "asc" })
    .exec();

  return { activeRouteId, routes: syncedRoutes };
}

export async function syncRouteToStops(
  db: MyDatabase,
  tripId: string,
  routeId: string,
): Promise<void> {
  const [routeStops, routeStopsDocs] = await Promise.all([
    db.route_stops
      .find({ selector: { tripId, routeId } })
      .sort({ order: "asc", createdAt: "asc", id: "asc" })
      .exec(),
    db.stops
      .find({ selector: { tripId, routeId } })
      .sort({ createdAt: "asc", id: "asc" })
      .exec(),
  ]);

  const existingByName = new Map<string, string[]>();
  const existingIndexByName = new Map<string, number>();
  for (const stop of routeStopsDocs) {
    const key = stop.name.trim().toLowerCase();
    const current = existingByName.get(key) ?? [];
    current.push(stop.id);
    existingByName.set(key, current);
    if (!existingIndexByName.has(key)) {
      existingIndexByName.set(key, 0);
    }
  }

  for (const routeStop of routeStops) {
    const key = routeStop.name.trim().toLowerCase();
    const ids = existingByName.get(key) ?? [];
    const index = existingIndexByName.get(key) ?? 0;
    const existingStopId = ids[index];
    existingIndexByName.set(key, index + 1);

    if (existingStopId) {
      const existing = routeStopsDocs.find(
        (stop) => stop.id === existingStopId,
      );
      if (existing && existing.name !== routeStop.name) {
        await existing.patch({ name: routeStop.name, updatedAt: Date.now() });
      }
      continue;
    }

    await db.stops.insert({
      id: generateId(),
      name: routeStop.name,
      tripId,
      routeId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

export async function activateRoute(
  db: MyDatabase,
  tripId: string,
  routeId: string,
): Promise<void> {
  const trip = await getTrip(db, tripId);
  await trip.patch({ activeRouteId: routeId, updatedAt: Date.now() });
  await syncRouteToStops(db, tripId, routeId);
}

export async function createRoute(
  db: MyDatabase,
  tripId: string,
  payload: { name: string; sourceRouteId?: string },
): Promise<RouteDocumentType> {
  const now = Date.now();
  const routeId = generateId();
  const existingRoutes = await db.routes
    .find({ selector: { tripId } })
    .sort({ createdAt: "asc", id: "asc" })
    .exec();

  const route = await db.routes.insert({
    id: routeId,
    tripId,
    name: payload.name,
    color: ROUTE_COLORS[existingRoutes.length % ROUTE_COLORS.length],
    createdAt: now,
    updatedAt: now,
  });

  const sourceRouteId = payload.sourceRouteId;
  if (sourceRouteId) {
    const sourceStops = await db.route_stops
      .find({ selector: { tripId, routeId: sourceRouteId } })
      .sort({ order: "asc", createdAt: "asc", id: "asc" })
      .exec();

    await Promise.all(
      sourceStops.map((stop, index) =>
        db.route_stops.insert({
          id: generateId(),
          tripId,
          routeId,
          name: stop.name,
          order: index,
          startDate: stop.startDate,
          endDate: stop.endDate,
          latitude: stop.latitude,
          longitude: stop.longitude,
          countryCode: stop.countryCode,
          timezone: stop.timezone,
          intel: stop.intel,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );
  }

  return route;
}

export async function duplicateRoute(
  db: MyDatabase,
  tripId: string,
  routeId: string,
): Promise<RouteDocumentType> {
  const source = await db.routes.findOne(routeId).exec();
  if (!source) {
    throw new Error("Route not found");
  }
  return createRoute(db, tripId, {
    name: `${source.name} Copy`,
    sourceRouteId: routeId,
  });
}

export async function deleteRoute(
  db: MyDatabase,
  tripId: string,
  routeId: string,
): Promise<void> {
  const [trip, routes] = await Promise.all([
    getTrip(db, tripId),
    db.routes
      .find({ selector: { tripId } })
      .sort({ createdAt: "asc", id: "asc" })
      .exec(),
  ]);

  const target = routes.find((route) => route.id === routeId);
  if (!target) {
    return;
  }

  if (routes.length === 1) {
    throw new Error("Cannot delete the last route");
  }

  const fallbackRouteId = routes.find((route) => route.id !== routeId)?.id;
  if (!fallbackRouteId) {
    throw new Error("No fallback route available");
  }

  const [routeStops, routePreferences, linkedStops] = await Promise.all([
    db.route_stops.find({ selector: { tripId, routeId } }).exec(),
    db.route_preferences.find({ selector: { tripId, routeId } }).exec(),
    db.stops.find({ selector: { tripId, routeId } }).exec(),
  ]);

  await Promise.all([
    ...routeStops.map((doc) => doc.remove()),
    ...routePreferences.map((doc) => doc.remove()),
    ...linkedStops.map((stop) =>
      stop.patch({ routeId: undefined, updatedAt: Date.now() }),
    ),
    target.remove(),
  ]);

  if (trip.activeRouteId === routeId) {
    await trip.patch({ activeRouteId: fallbackRouteId, updatedAt: Date.now() });
  }
}

export async function reorderRouteStops(
  routeStops: RouteStopDocumentType[],
  orderedIds: string[],
): Promise<void> {
  const orderById = new Map(orderedIds.map((id, index) => [id, index]));
  await Promise.all(
    routeStops.map((routeStop) => {
      const nextOrder = orderById.get(routeStop.id);
      if (nextOrder === undefined || nextOrder === routeStop.order) {
        return Promise.resolve();
      }
      return routeStop.patch({ order: nextOrder, updatedAt: Date.now() });
    }),
  );
}

export async function upsertRoutePreference(
  db: MyDatabase,
  tripId: string,
  routeId: string,
  weights: RouteCompareWeights,
): Promise<void> {
  const current = await db.route_preferences
    .findOne({ selector: { tripId, routeId } })
    .exec();

  const now = Date.now();
  if (current) {
    await current.patch({ weights, updatedAt: now });
    return;
  }

  await db.route_preferences.insert({
    id: generateId(),
    tripId,
    routeId,
    weights,
    createdAt: now,
    updatedAt: now,
  });
}

export async function ensureRoutePreference(
  db: MyDatabase,
  tripId: string,
  routeId: string,
): Promise<RouteCompareWeights> {
  const preference = await db.route_preferences
    .findOne({ selector: { tripId, routeId } })
    .exec();

  if (preference) {
    return preference.weights;
  }

  await upsertRoutePreference(
    db,
    tripId,
    routeId,
    DEFAULT_ROUTE_COMPARE_WEIGHTS,
  );
  return DEFAULT_ROUTE_COMPARE_WEIGHTS;
}

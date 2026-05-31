import { useEffect, useState } from "react";
import { getDatabase, MyDatabase } from "@/lib/rxdb-database";
import {
  AccommodationDocumentType,
  ExpenseDocumentType,
  RouteDocumentType,
  RouteStopDocumentType,
  StopDocumentType,
  TransportDocumentType,
  TripDocumentType,
} from "@/lib/rxdb-schema";

export type UseTripDataResult = {
  trip: TripDocumentType | null;
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expenses: ExpenseDocumentType[];
  routes: RouteDocumentType[];
  routeStops: RouteStopDocumentType[];
  loading: boolean;
};

type UseTripDataOptions = {
  database?: MyDatabase | null;
  enabled?: boolean;
  selectedRouteId?: string | null;
};

const emptyTripData: UseTripDataResult = {
  trip: null,
  stops: [],
  accommodationsByStop: {},
  transportsByStop: {},
  expenses: [],
  routes: [],
  routeStops: [],
  loading: false,
};

export function useTripData(
  tripId: string,
  options?: UseTripDataOptions,
): UseTripDataResult {
  const {
    database: initialDatabase = null,
    enabled = true,
    selectedRouteId = null,
  } = options ?? {};
  const [loadedDatabase, setLoadedDatabase] = useState<MyDatabase | null>(null);
  const [trip, setTrip] = useState<TripDocumentType | null>(null);
  const [stops, setStops] = useState<StopDocumentType[]>([]);
  const [accommodationsByStop, setAccommodationsByStop] = useState<
    Record<string, AccommodationDocumentType[]>
  >({});
  const [transportsByStop, setTransportsByStop] = useState<
    Record<string, TransportDocumentType[]>
  >({});
  const [expenses, setExpenses] = useState<ExpenseDocumentType[]>([]);
  const [routes, setRoutes] = useState<RouteDocumentType[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStopDocumentType[]>([]);
  const [resolvedTripId, setResolvedTripId] = useState<string | null>(null);
  const database = initialDatabase ?? loadedDatabase;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (initialDatabase) {
      return;
    }

    let isSubscribed = true;

    const fetchDatabase = async () => {
      const db = await getDatabase();
      if (isSubscribed) {
        setLoadedDatabase(db);
      }
    };

    fetchDatabase();

    return () => {
      isSubscribed = false;
    };
  }, [enabled, initialDatabase]);

  useEffect(() => {
    if (!enabled || !database) {
      return;
    }

    const subscription = database.trips
      .findOne(tripId)
      .$.subscribe((tripRecord) => {
        setTrip(tripRecord);
        setResolvedTripId(tripId);
      });

    return () => subscription.unsubscribe();
  }, [database, enabled, tripId]);

  useEffect(() => {
    if (!enabled || !database) {
      return;
    }

    const selector = selectedRouteId
      ? { tripId, routeId: selectedRouteId }
      : { tripId };

    const subscription = database.stops
      .find({ selector })
      .sort({ createdAt: "asc", id: "asc" })
      .$.subscribe((stopsRecords) => {
        setStops(stopsRecords);
      });

    return () => subscription.unsubscribe();
  }, [database, enabled, selectedRouteId, tripId]);

  useEffect(() => {
    if (!enabled || !database) {
      return;
    }

    const stopIds = stops.map((stop) => stop.id);

    if (stopIds.length === 0) {
      setAccommodationsByStop({});
      return;
    }

    const subscription = database.accommodations
      .find({ selector: { stopId: { $in: stopIds } } })
      .sort({ checkIn: "asc", createdAt: "asc" })
      .$.subscribe((allAccommodations) => {
        const nextAccommodationsByStop: Record<
          string,
          AccommodationDocumentType[]
        > = {};

        allAccommodations.forEach((accommodation) => {
          if (!nextAccommodationsByStop[accommodation.stopId]) {
            nextAccommodationsByStop[accommodation.stopId] = [];
          }
          nextAccommodationsByStop[accommodation.stopId].push(accommodation);
        });

        setAccommodationsByStop(nextAccommodationsByStop);
      });

    return () => subscription.unsubscribe();
  }, [database, enabled, stops]);

  useEffect(() => {
    if (!enabled || !database) {
      return;
    }

    const subscription = database.routes
      .find({ selector: { tripId } })
      .sort({ createdAt: "asc", id: "asc" })
      .$.subscribe((routeRecords) => {
        setRoutes(routeRecords);
      });

    return () => subscription.unsubscribe();
  }, [database, enabled, tripId]);

  useEffect(() => {
    if (!enabled || !database) {
      return;
    }

    const selector = selectedRouteId
      ? { tripId, routeId: selectedRouteId }
      : { tripId };

    const subscription = database.route_stops
      .find({ selector })
      .sort({ order: "asc", createdAt: "asc", id: "asc" })
      .$.subscribe((records) => {
        setRouteStops(records);
      });

    return () => subscription.unsubscribe();
  }, [database, enabled, selectedRouteId, tripId]);

  useEffect(() => {
    if (!enabled || !database) {
      return;
    }

    const subscription = database.expenses
      .find({ selector: { tripId } })
      .sort({ date: "asc", createdAt: "asc" })
      .$.subscribe((expenseRecords) => {
        setExpenses(expenseRecords);
      });

    return () => subscription.unsubscribe();
  }, [database, enabled, tripId]);

  useEffect(() => {
    if (!enabled || !database) {
      return;
    }

    const stopIds = stops.map((stop) => stop.id);

    if (stopIds.length === 0) {
      setTransportsByStop({});
      return;
    }

    const subscription = database.transports
      .find({ selector: { stopId: { $in: stopIds } } })
      .sort({ departureDateTime: "asc", createdAt: "asc" })
      .$.subscribe((allTransports) => {
        const nextTransportsByStop: Record<string, TransportDocumentType[]> =
          {};

        allTransports.forEach((transport) => {
          if (!nextTransportsByStop[transport.stopId]) {
            nextTransportsByStop[transport.stopId] = [];
          }
          nextTransportsByStop[transport.stopId].push(transport);
        });

        setTransportsByStop(nextTransportsByStop);
      });

    return () => subscription.unsubscribe();
  }, [database, enabled, stops]);

  if (!enabled) {
    return emptyTripData;
  }

  const loading = !database || resolvedTripId !== tripId;

  return {
    trip,
    stops,
    accommodationsByStop,
    transportsByStop,
    expenses,
    routes,
    routeStops,
    loading,
  };
}

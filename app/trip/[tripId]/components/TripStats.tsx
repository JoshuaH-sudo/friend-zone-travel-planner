"use client";
import {
  TripDocumentType,
  StopDocumentType,
  AccommodationDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { getDatabase, MyDatabase } from "@/lib/rxdb-database";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TripStats({
  tripId,
}: {
  tripId: string;
}) {
  const [database, setDatabase] = useState<MyDatabase | null>(null);
  const [trip, setTrip] = useState<TripDocumentType | null>(null);
  const [stops, setStops] = useState<StopDocumentType[]>([]);
  const [accommodationsByStop, setAccommodationsByStop] = useState<
    Record<string, AccommodationDocumentType[]>
  >({});
  const [transportsByStop, setTransportsByStop] = useState<
    Record<string, TransportDocumentType[]>
  >({});

  useEffect(() => {
    const fetchDatabase = async () => {
      const db = await getDatabase();
      setDatabase(db);
    };

    fetchDatabase();
  }, []);

  useEffect(() => {
    if (!database) return;

    const subscription = database.trips.findOne(tripId).$.subscribe((tripRecord) => {
      setTrip(tripRecord);
    });

    return () => subscription.unsubscribe();
  }, [database, tripId]);

  useEffect(() => {
    if (!database) return;

    const subscription = database.stops
      .find({ selector: { tripId } })
      .sort({ date: "asc", createdAt: "asc" })
      .$.subscribe((stopsRecords) => {
        setStops(stopsRecords);
      });

    return () => subscription.unsubscribe();
  }, [database, tripId]);

  useEffect(() => {
    if (!database) return;

    const subscription = database.accommodations
      .find()
      .sort({ checkIn: "asc", createdAt: "asc" })
      .$.subscribe((allAccommodations) => {
        const accomMap: Record<string, AccommodationDocumentType[]> = {};
        allAccommodations.forEach((accommodation) => {
          if (!accomMap[accommodation.stopId]) {
            accomMap[accommodation.stopId] = [];
          }
          accomMap[accommodation.stopId].push(accommodation);
        });
        setAccommodationsByStop(accomMap);
      });

    return () => subscription.unsubscribe();
  }, [database]);

  useEffect(() => {
    if (!database) return;

    const subscription = database.transports
      .find()
      .sort({ date: "asc", createdAt: "asc" })
      .$.subscribe((allTransports) => {
        const transportMap: Record<string, TransportDocumentType[]> = {};
        allTransports.forEach((transport) => {
          if (!transportMap[transport.stopId]) {
            transportMap[transport.stopId] = [];
          }
          transportMap[transport.stopId].push(transport);
        });
        setTransportsByStop(transportMap);
      });

    return () => subscription.unsubscribe();
  }, [database]);

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
        <CardTitle>Trip Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {stats.stopCount}{" "}
            {stats.stopCount === 1 ? "Destination" : "Destinations"}
          </Badge>
          <Badge variant="secondary">
            {stats.accommodationCount}{" "}
            {stats.accommodationCount === 1
              ? "Accommodation"
              : "Accommodations"}
          </Badge>
          <Badge variant="secondary">
            {stats.transportCount}{" "}
            {stats.transportCount === 1 ? "Transport" : "Transports"}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Duration:</span>
            <span className="text-muted-foreground">
              {stats.startDate
                ? new Date(stats.startDate).toLocaleDateString()
                : "N/A"}{" "}
              →{" "}
              {stats.endDate
                ? new Date(stats.endDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Days:</span>
            <span className="text-muted-foreground">{stats.totalDays}</span>
          </div>
        </div>

        {Object.keys(stats.currencyTotals).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Total Cost:</p>
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

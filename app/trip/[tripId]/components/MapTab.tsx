"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { StopDocumentType } from "@/lib/rxdb-schema";

type Coordinates = { lat: number; lon: number };
type MapTabProps = {
  stops: StopDocumentType[];
};

const markerIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:hsl(150 30% 28%);border:2px solid white;box-shadow:0 2px 10px rgba(0,0,0,.25)"></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function Recenter({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    map.fitBounds(positions, { padding: [32, 32] });
  }, [map, positions]);
  return null;
}

export function MapTab({ stops }: MapTabProps) {
  const [coordinatesByStopId, setCoordinatesByStopId] = useState<
    Record<string, Coordinates>
  >({});

  useEffect(() => {
    let cancelled = false;
    const key = "fzt-geocode-cache-v1";
    const cache = JSON.parse(localStorage.getItem(key) ?? "{}") as Record<
      string,
      Coordinates
    >;

    const findCoordinates = async () => {
      const updates: Record<string, Coordinates> = {};

      for (const stop of stops) {
        if (!stop.name.trim()) continue;
        if (cache[stop.name]) {
          updates[stop.id] = cache[stop.name];
          continue;
        }

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(stop.name)}&format=json&limit=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          },
        );
        const result = (await response.json()) as Array<{ lat: string; lon: string }>;
        if (result[0]) {
          const coords = {
            lat: Number(result[0].lat),
            lon: Number(result[0].lon),
          };
          cache[stop.name] = coords;
          updates[stop.id] = coords;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (cancelled) return;
      localStorage.setItem(key, JSON.stringify(cache));
      setCoordinatesByStopId((current) => ({ ...current, ...updates }));
    };

    findCoordinates();

    return () => {
      cancelled = true;
    };
  }, [stops]);

  const positions = useMemo(
    () =>
      stops
        .map((stop) => coordinatesByStopId[stop.id])
        .filter((coords): coords is Coordinates => Boolean(coords))
        .map((coords) => [coords.lat, coords.lon] as [number, number]),
    [coordinatesByStopId, stops],
  );

  if (stops.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center">
        Add stops to see them on the map.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <MapContainer
        center={positions[0] ?? [48.8566, 2.3522]}
        zoom={4}
        className="h-[420px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positions.length > 0 ? <Recenter positions={positions} /> : null}
        {stops.map((stop) => {
          const coords = coordinatesByStopId[stop.id];
          if (!coords) return null;
          return (
            <Marker key={stop.id} position={[coords.lat, coords.lon]} icon={markerIcon}>
              <Popup>{stop.name}</Popup>
            </Marker>
          );
        })}
        {positions.length > 1 ? <Polyline positions={positions} /> : null}
      </MapContainer>
    </div>
  );
}

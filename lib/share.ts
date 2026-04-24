import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { nanoid } from "nanoid";
import { MyDatabase } from "@/lib/rxdb-database";
import {
  AccommodationDocument,
  ExpenseDocument,
  StopDocument,
  TransportDocument,
  TripDocument,
} from "@/lib/rxdb-schema";

type ShareBundle = {
  v: 1;
  trip: TripDocument;
  stops: StopDocument[];
  accommodations: AccommodationDocument[];
  transports: TransportDocument[];
  expenses: ExpenseDocument[];
};

async function getShareBundle(db: MyDatabase, tripId: string): Promise<ShareBundle> {
  const trip = await db.trips.findOne(tripId).exec();
  if (!trip) {
    throw new Error("Trip not found.");
  }

  const stops = await db.stops.find({ selector: { tripId } }).exec();
  const stopIds = new Set(stops.map((stop) => stop.id));
  const stopIdList = [...stopIds];
  const [accommodations, transports, expenses] = await Promise.all([
    stopIdList.length
      ? db.accommodations
          .find({ selector: { stopId: { $in: stopIdList } } })
          .exec()
      : Promise.resolve([]),
    stopIdList.length
      ? db.transports.find({ selector: { stopId: { $in: stopIdList } } }).exec()
      : Promise.resolve([]),
    db.expenses.find({ selector: { tripId } }).exec(),
  ]);

  return {
    v: 1,
    trip: trip.toJSON(),
    stops: stops.map((stop) => stop.toJSON()),
    accommodations: accommodations.map((doc) => doc.toJSON()),
    transports: transports.map((doc) => doc.toJSON()),
    expenses: expenses.map((doc) => doc.toJSON()),
  };
}

export async function exportTripJson(db: MyDatabase, tripId: string) {
  const payload = await getShareBundle(db, tripId);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `trip-${tripId}.json`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export async function copyShareLink(db: MyDatabase, tripId: string) {
  const payload = await getShareBundle(db, tripId);
  const compressed = compressToEncodedURIComponent(JSON.stringify(payload));
  const link = `${window.location.origin}/?import=${compressed}`;
  await navigator.clipboard.writeText(link);
}

export function decodeShareLink(encoded: string): ShareBundle {
  const decoded = decompressFromEncodedURIComponent(encoded);
  if (!decoded) {
    throw new Error("Invalid share payload.");
  }
  const parsed = JSON.parse(decoded) as ShareBundle;
  if (parsed.v !== 1) {
    throw new Error("Unsupported share payload.");
  }
  return parsed;
}

export async function importSharedTrip(db: MyDatabase, encoded: string) {
  const payload = decodeShareLink(encoded);
  const now = Date.now();
  const tripId = nanoid();
  const stopIdMap = new Map<string, string>();

  await db.trips.insert({
    id: tripId,
    name: payload.trip.name || "Imported Trip",
    createdAt: now,
    updatedAt: now,
  });

  for (const stop of payload.stops) {
    const newStopId = nanoid();
    stopIdMap.set(stop.id, newStopId);
    await db.stops.insert({
      id: newStopId,
      name: typeof stop.name === "string" ? stop.name : "Stop",
      tripId,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const accommodation of payload.accommodations) {
    const mappedStopId = stopIdMap.get(String(accommodation.stopId));
    if (!mappedStopId) continue;
    await db.accommodations.insert({
      ...accommodation,
      id: nanoid(),
      stopId: mappedStopId,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const transport of payload.transports) {
    const mappedStopId = stopIdMap.get(String(transport.stopId));
    if (!mappedStopId) continue;
    await db.transports.insert({
      ...transport,
      id: nanoid(),
      stopId: mappedStopId,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const expense of payload.expenses) {
    await db.expenses.insert({
      ...expense,
      id: nanoid(),
      tripId,
      createdAt: now,
      updatedAt: now,
    });
  }

  return tripId;
}

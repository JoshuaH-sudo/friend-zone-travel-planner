import { addRxPlugin, createRxDatabase, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import {
  tripSchema,
  stopSchema,
  accommodationSchema,
  transportSchema,
  TripCollection,
  StopCollection,
  AccommodationCollection,
  TransportCollection,
} from "./rxdb-schema";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

export type DatabaseCollections = {
  trips: TripCollection;
  stops: StopCollection;
  accommodations: AccommodationCollection;
  transports: TransportCollection;
};

export type MyDatabase = RxDatabase<DatabaseCollections>;

let dbPromise: Promise<MyDatabase> | null = null;

addRxPlugin(RxDBDevModePlugin);

export async function getDatabase(): Promise<MyDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = createDatabase();
  return dbPromise;
}

async function createDatabase(): Promise<MyDatabase> {
  console.log("Creating RxDB database...");

  const db = await createRxDatabase<DatabaseCollections>({
    name: "fzt-db",
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie(),
    }),
    multiInstance: true,
    eventReduce: true,
  });

  console.log("RxDB database created");

  // Add collections
  await db.addCollections({
    trips: {
      schema: tripSchema,
    },
    stops: {
      schema: stopSchema,
    },
    accommodations: {
      schema: accommodationSchema,
    },
    transports: {
      schema: transportSchema,
    },
  });

  console.log("Collections added");

  return db;
}

// Helper function to generate IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

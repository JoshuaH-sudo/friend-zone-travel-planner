import { addRxPlugin, createRxDatabase, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
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
import CryptoJS from "crypto-js";

// Custom hash function that works in non-secure contexts
function customHashFunction(input: string) {
  // Fallback to CryptoJS for non-secure contexts (like mobile browsers over HTTP)
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}

export type DatabaseCollections = {
  trips: TripCollection;
  stops: StopCollection;
  accommodations: AccommodationCollection;
  transports: TransportCollection;
};

export type MyDatabase = RxDatabase<DatabaseCollections>;

let dbPromise: Promise<MyDatabase> | null = null;

addRxPlugin(RxDBQueryBuilderPlugin);

const isDevMode = process.env.NODE_ENV === "development";
const cryptoAvailable = typeof crypto !== "undefined" && crypto.subtle;

if (isDevMode) {
  console.log("Enabling RxDB Dev Mode plugin");
  addRxPlugin(RxDBDevModePlugin);
} else {
  console.log("Production mode - RxDB Dev Mode plugin not enabled");
}

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
    hashFunction:
      isDevMode && !cryptoAvailable ? customHashFunction : undefined,
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
  if (isDevMode && !cryptoAvailable) {
    return customHashFunction(Date.now().toString() + Math.random().toString());
  }
  return crypto.randomUUID();
}

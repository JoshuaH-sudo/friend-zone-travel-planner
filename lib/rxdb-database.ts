import { addRxPlugin, createRxDatabase, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration-schema";
import {
  tripSchema,
  stopSchema,
  accommodationSchema,
  transportSchema,
  expenseSchema,
  userSettingsSchema,
  TripCollection,
  StopCollection,
  StopDocument,
  AccommodationCollection,
  TransportCollection,
  ExpenseCollection,
  UserSettingsCollection,
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
  expenses: ExpenseCollection;
  settings: UserSettingsCollection;
};

export type MyDatabase = RxDatabase<DatabaseCollections>;

export const DB_NAME = "fzt-db";

let dbPromise: Promise<MyDatabase> | null = null;

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);

const isDevMode = process.env.NODE_ENV === "development";
const cryptoAvailable = typeof crypto !== "undefined" && crypto.subtle;

if (isDevMode) {
  console.log("Enabling RxDB Dev Mode plugin");
  addRxPlugin(RxDBDevModePlugin);
} else {
  console.log("Production mode - RxDB Dev Mode plugin not enabled");
}

/** Dev-only: set `localStorage.setItem('fzt_simulate_db_error', '1')` in the
 *  browser console to make the next database initialisation throw, simulating a
 *  real-world load failure.  Remove the flag with
 *  `localStorage.removeItem('fzt_simulate_db_error')` and reload to recover. */
export async function getDatabase(): Promise<MyDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  if (
    isDevMode &&
    typeof localStorage !== "undefined" &&
    localStorage.getItem("fzt_simulate_db_error") === "1"
  ) {
    const err = new Error(
      "[DEV] Simulated database initialisation failure (fzt_simulate_db_error flag is set)",
    );
    dbPromise = Promise.reject(err);
    // Prevent the rejected promise from being cached for the next real load
    dbPromise.catch(() => {
      dbPromise = null;
    });
    return dbPromise;
  }

  dbPromise = createDatabase();
  return dbPromise;
}

async function createDatabase(): Promise<MyDatabase> {
  console.log("Creating RxDB database...");

  const db = await createRxDatabase<DatabaseCollections>({
    name: DB_NAME,
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie(),
    }),
    multiInstance: true,
    eventReduce: true,
    //@ts-expect-error only used in dev mode
    hashFunction:
      isDevMode && !cryptoAvailable ? customHashFunction : undefined,
  });

  console.log("RxDB database created");

  // Add collections
  await db.addCollections({
    trips: {
      schema: tripSchema,
      migrationStrategies: {
        1: (oldDoc) => ({ ...oldDoc, budget: undefined }),
        2: (oldDoc) => ({ ...oldDoc, startDate: undefined }),
        3: (oldDoc) => ({ ...oldDoc, startLocation: undefined }),
      },
    },
    stops: {
      schema: stopSchema,
      migrationStrategies: {
        1: (oldDoc) => {
          type OldStopDocument = StopDocument & { date: string };
          const { date: _date, ...rest } = oldDoc as OldStopDocument;
          return rest;
        },
      },
    },
    accommodations: {
      schema: accommodationSchema,
      migrationStrategies: {
        1: (oldDoc) => ({ ...oldDoc, timezone: undefined }),
      },
    },
    transports: {
      schema: transportSchema,
      migrationStrategies: {
        1: (oldDoc) => ({
          ...oldDoc,
          departureTime: undefined,
          arrivalTime: undefined,
          timezone: undefined,
        }),
        // v1 → v2: merge `date` + optional `departureTime`/`arrivalTime` into
        // `departureDateTime` / `arrivalDateTime` ISO datetime strings.
        // Note: the old schema stored a single `date` for both departure and
        // arrival. Arrival on a different calendar day was not representable, so
        // we place both events on the same date — the best approximation from
        // the available data.
        2: (oldDoc) => {
          const { date, departureTime, arrivalTime, ...rest } = oldDoc as {
            date: string;
            departureTime?: string;
            arrivalTime?: string;
            [key: string]: unknown;
          };
          return {
            ...rest,
            departureDateTime: departureTime
              ? `${date}T${departureTime}`
              : `${date}T12:00`,
            arrivalDateTime: arrivalTime ? `${date}T${arrivalTime}` : undefined,
          };
        },
      },
    },
    expenses: {
      schema: expenseSchema,
    },
    settings: {
      schema: userSettingsSchema,
      migrationStrategies: {
        1: (oldDoc) => ({ ...oldDoc, timezone: "UTC" }),
        2: (oldDoc) => ({ ...oldDoc, dateFormat: "MM/dd/yyyy" }),
        3: (oldDoc) => ({
          ...oldDoc,
          analyticsConsent: false,
          cookiesConsent: false,
        }),
      },
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

/** Prefix used by the Dexie storage adapter for every per-collection IndexedDB database. */
const RXDB_DEXIE_DB_PREFIX = `rxdb-dexie-${DB_NAME}--`;

/**
 * Deletes all IndexedDB databases created by RxDB's Dexie storage adapter for
 * this app.  Safe to call at any time; resolves even if individual deletions
 * fail so the caller can always proceed with a reload.
 */
export async function deleteDatabaseData(): Promise<void> {
  if (typeof indexedDB === "undefined" || !indexedDB.databases) {
    return;
  }
  const allDbs = await indexedDB.databases();
  const toDelete = allDbs
    .map((db) => db.name)
    .filter(
      (name): name is string =>
        typeof name === "string" && name.startsWith(RXDB_DEXIE_DB_PREFIX),
    );
  await Promise.all(
    toDelete.map(
      (name) =>
        new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        }),
    ),
  );
}

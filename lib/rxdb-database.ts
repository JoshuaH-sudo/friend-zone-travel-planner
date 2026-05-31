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
  routeSchema,
  routeStopSchema,
  routePreferenceSchema,
  userSettingsSchema,
  TripCollection,
  StopCollection,
  StopDocument,
  AccommodationCollection,
  TransportCollection,
  ExpenseCollection,
  RouteCollection,
  RouteStopCollection,
  RoutePreferenceCollection,
  UserSettingsCollection,
} from "./rxdb-schema";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import CryptoJS from "crypto-js";
import { DEFAULT_ROUTE_COMPARE_WEIGHTS } from "@/lib/routes/constants";

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
  routes: RouteCollection;
  route_stops: RouteStopCollection;
  route_preferences: RoutePreferenceCollection;
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
        4: (oldDoc) => ({ ...oldDoc, bannerColor: undefined }),
        5: (oldDoc) => ({
          ...oldDoc,
          status: "planning",
          activeRouteId: undefined,
        }),
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
        2: (oldDoc) => ({ ...oldDoc, routeId: undefined }),
      },
    },
    accommodations: {
      schema: accommodationSchema,
      migrationStrategies: {
        1: (oldDoc) => ({ ...oldDoc, timezone: undefined }),
        2: (oldDoc) => ({ ...oldDoc, routeId: undefined }),
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
        3: (oldDoc) => ({ ...oldDoc, routeId: undefined }),
      },
    },
    expenses: {
      schema: expenseSchema,
      migrationStrategies: {
        1: (oldDoc) => ({ ...oldDoc, routeId: undefined }),
      },
    },
    routes: {
      schema: routeSchema,
    },
    route_stops: {
      schema: routeStopSchema,
    },
    route_preferences: {
      schema: routePreferenceSchema,
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
        4: (oldDoc) => ({
          ...oldDoc,
          compareWeights: DEFAULT_ROUTE_COMPARE_WEIGHTS,
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
export const RXDB_DEXIE_DB_PREFIX = `rxdb-dexie-${DB_NAME}--`;

/** Name of the Dexie object store that holds RxDB documents in each collection database. */
export const RXDB_DEXIE_DOCS_STORE = "docs";

function deleteIndexedDbByName(name: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = () => resolve();
    req.onerror = () => {
      console.error("Failed to delete database:", name, req.error);
      resolve();
    };
    req.onblocked = () => {
      console.warn("Database deletion blocked for:", name);
      resolve();
    };
  });
}

/**
 * Deletes all IndexedDB databases created by RxDB's Dexie storage adapter for
 * this app.  Safe to call at any time; resolves even if individual deletions
 * fail so the caller can always proceed with a reload.
 *
 * Falls back to known versioned database names when `indexedDB.databases()` is
 * unavailable (e.g. Safari), so the recovery flow works cross-browser.
 */
export async function deleteDatabaseData(): Promise<void> {
  if (typeof indexedDB === "undefined") {
    return;
  }

  // Build candidate names from the known current schema versions. This serves
  // as the cross-browser fallback (e.g. Safari lacks indexedDB.databases()).
  const candidateDbNames = new Set<string>([
    DB_NAME,
    `${RXDB_DEXIE_DB_PREFIX}${tripSchema.version}--trips`,
    `${RXDB_DEXIE_DB_PREFIX}${stopSchema.version}--stops`,
    `${RXDB_DEXIE_DB_PREFIX}${accommodationSchema.version}--accommodations`,
    `${RXDB_DEXIE_DB_PREFIX}${transportSchema.version}--transports`,
    `${RXDB_DEXIE_DB_PREFIX}${expenseSchema.version}--expenses`,
    `${RXDB_DEXIE_DB_PREFIX}${routeSchema.version}--routes`,
    `${RXDB_DEXIE_DB_PREFIX}${routeStopSchema.version}--route_stops`,
    `${RXDB_DEXIE_DB_PREFIX}${routePreferenceSchema.version}--route_preferences`,
    `${RXDB_DEXIE_DB_PREFIX}${userSettingsSchema.version}--settings`,
  ]);

  // Enumerate all existing databases when the API is available (Chrome/Firefox)
  // to catch any databases from previous schema versions.
  if (indexedDB.databases) {
    const allDbs = await indexedDB.databases();
    for (const { name } of allDbs) {
      if (typeof name === "string" && name.startsWith(RXDB_DEXIE_DB_PREFIX)) {
        candidateDbNames.add(name);
      }
    }
  }

  await Promise.all(
    [...candidateDbNames].map((name) => deleteIndexedDbByName(name)),
  );
}

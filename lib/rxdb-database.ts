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
      },
    },
    stops: {
      schema: stopSchema,
      migrationStrategies: {
        1: (oldDoc) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { date: _date, ...rest } = oldDoc as { date: unknown; [key: string]: unknown };
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

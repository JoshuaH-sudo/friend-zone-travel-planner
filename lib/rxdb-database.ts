import { createRxDatabase, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import {
  tripSchema,
  stopSchema,
  accommodationSchema,
  transportSchema,
  TripDocument,
  StopDocument,
  AccommodationDocument,
  TransportDocument,
} from "./rxdb-schema";

export type DatabaseCollections = {
  trips: any;
  stops: any;
  accommodations: any;
  transports: any;
};

export type MyDatabase = RxDatabase<DatabaseCollections>;

let dbPromise: Promise<MyDatabase> | null = null;

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
    storage: getRxStorageDexie(),
    multiInstance: true,
    eventReduce: true,
    cleanupPolicy: {
      minimumDeletedTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      minimumCollectionAge: 1000 * 60, // 60 seconds
      runEach: 1000 * 60 * 5, // 5 minutes
      awaitReplicationsInSync: true,
      waitForLeadership: true,
    },
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

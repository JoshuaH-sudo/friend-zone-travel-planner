import { MyDatabase, RXDB_DEXIE_DB_PREFIX, RXDB_DEXIE_DOCS_STORE } from "@/lib/rxdb-database";
import {
  AccommodationDocument,
  ExpenseDocument,
  StopDocument,
  TransportDocument,
  TripDocument,
  USER_SETTINGS_ID,
  UserSettingsDocument,
  DateFormat,
  tripSchema,
  stopSchema,
  accommodationSchema,
  transportSchema,
  expenseSchema,
  userSettingsSchema,
} from "@/lib/rxdb-schema";

/**
 * Detects the user's timezone from the browser.
 */
export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Detects the user's preferred date format based on their browser locale.
 * Uses a sample date to determine the order of day/month/year.
 */
export function detectBrowserDateFormat(): DateFormat {
  try {
    // Use a date where day, month, and year are all different to detect format
    const sampleDate = new Date(2024, 11, 25); // Dec 25, 2024
    const formatted = new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(sampleDate);

    // Check the position of "25" (day) and "12" (month) to determine format
    const dayIndex = formatted.indexOf("25");
    const monthIndex = formatted.indexOf("12");

    if (dayIndex < monthIndex) {
      return "dd/MM/yyyy"; // Day comes first (e.g., UK, Europe)
    } else if (formatted.startsWith("2024")) {
      return "yyyy-MM-dd"; // Year comes first (e.g., ISO, some Asian countries)
    } else {
      return "MM/dd/yyyy"; // Month comes first (e.g., US)
    }
  } catch {
    return "MM/dd/yyyy";
  }
}

export const APP_DATA_EXPORT_VERSION = 1;
export const ALLOWED_THEME_VALUES = ["light", "dark", "system"] as const;
export type AllowedThemeValue = (typeof ALLOWED_THEME_VALUES)[number];

export type AppDataExport = {
  version: number;
  exportedAt: string;
  preferences: {
    theme: AllowedThemeValue | null;
  };
  data: {
    trips: TripDocument[];
    stops: StopDocument[];
    accommodations: AccommodationDocument[];
    transports: TransportDocument[];
    expenses: ExpenseDocument[];
    settings: UserSettingsDocument[];
  };
};

export async function exportAppData(
  db: MyDatabase,
  preferences: AppDataExport["preferences"],
) {
  const [trips, stops, accommodations, transports, expenses, settings] =
    await Promise.all([
      db.trips.find().exec(),
      db.stops.find().exec(),
      db.accommodations.find().exec(),
      db.transports.find().exec(),
      db.expenses.find().exec(),
      db.settings.find().exec(),
    ]);

  const payload: AppDataExport = {
    version: APP_DATA_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    preferences,
    data: {
      trips: trips.map((doc) => doc.toJSON()),
      stops: stops.map((doc) => doc.toJSON()),
      accommodations: accommodations.map((doc) => doc.toJSON()),
      transports: transports.map((doc) => doc.toJSON()),
      expenses: expenses.map((doc) => doc.toJSON()),
      settings: settings.map((doc) => doc.toJSON()),
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `friend-zone-travel-planner-export-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports app data by reading directly from the underlying IndexedDB/Dexie
 * databases, bypassing RxDB entirely.  This is safe to call even when RxDB
 * fails to initialise (e.g. after a failed migration).
 *
 * The output format is identical to {@link exportAppData}, so the resulting
 * file can be imported via the Settings page once the database has been cleared.
 */
export async function exportRawDatabaseBackup(): Promise<void> {
  const collections = [
    { name: "trips", schema: tripSchema },
    { name: "stops", schema: stopSchema },
    { name: "accommodations", schema: accommodationSchema },
    { name: "transports", schema: transportSchema },
    { name: "expenses", schema: expenseSchema },
    { name: "settings", schema: userSettingsSchema },
  ] as const;

  /**
   * Opens a per-collection Dexie database directly via the raw IndexedDB API
   * and returns all non-deleted documents.
   *
   * RxDB/Dexie stores boolean fields that are part of indexes as the strings
   * '1' and '0'.  We restore `_deleted` to a proper boolean so the exported
   * JSON is accepted by `importAppData`.
   *
   * If the database does not exist, or the 'docs' object store is absent, an
   * empty array is returned without creating any new database files.
   */
  const readCollectionDocs = (
    dbName: string,
  ): Promise<Record<string, unknown>[]> => {
    return new Promise((resolve) => {
      const req = indexedDB.open(dbName);

      // Abort the open request when the database doesn't exist yet to avoid
      // creating an empty phantom database.
      req.onupgradeneeded = (event) => {
        (event.target as IDBOpenDBRequest).transaction?.abort();
      };

      // Covers both genuine open errors and the AbortError from onupgradeneeded.
      req.onerror = () => resolve([]);

      req.onsuccess = () => {
        const db = req.result;

        if (!db.objectStoreNames.contains(RXDB_DEXIE_DOCS_STORE)) {
          db.close();
          resolve([]);
          return;
        }

        try {
          const tx = db.transaction([RXDB_DEXIE_DOCS_STORE], "readonly");
          const getAllReq = tx.objectStore(RXDB_DEXIE_DOCS_STORE).getAll();

          getAllReq.onsuccess = () => {
            db.close();
            const docs = (
              getAllReq.result as Array<Record<string, unknown>>
            )
              // RxDB stores _deleted as the string '1' in Dexie
              .filter(
                (doc) => doc._deleted !== "1" && doc._deleted !== true,
              )
              .map((doc) => ({ ...doc, _deleted: false }));
            resolve(docs);
          };

          getAllReq.onerror = () => {
            db.close();
            resolve([]);
          };
        } catch {
          db.close();
          resolve([]);
        }
      };
    });
  };

  const results = await Promise.all(
    collections.map(async ({ name, schema }) => {
      const dbName = `${RXDB_DEXIE_DB_PREFIX}${schema.version}--${name}`;
      const docs = await readCollectionDocs(dbName);
      return { name, docs };
    }),
  );

  const data: Record<string, Record<string, unknown>[]> = {};
  for (const { name, docs } of results) {
    data[name] = docs;
  }

  const payload: AppDataExport = {
    version: APP_DATA_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    preferences: { theme: null },
    data: data as AppDataExport["data"],
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `friend-zone-travel-planner-recovery-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return isObject(value) && !Array.isArray(value);
}

export function isValidTheme(value: unknown): value is AllowedThemeValue {
  return ALLOWED_THEME_VALUES.includes(value as AllowedThemeValue);
}

function readArray<T>(value: unknown, key: string): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid export format: ${key}`);
  }
  if (!value.every((item) => isPlainObject(item))) {
    throw new Error(`Invalid export format: ${key}`);
  }
  return value as T[];
}

export async function importAppData(db: MyDatabase, content: string) {
  const parsed: unknown = JSON.parse(content);
  if (!isObject(parsed)) {
    throw new Error("Invalid export format.");
  }

  if (parsed.version !== APP_DATA_EXPORT_VERSION) {
    throw new Error("Unsupported export version.");
  }

  const dataValue = parsed.data;
  if (!isObject(dataValue)) {
    throw new Error("Invalid export format.");
  }

  const data = {
    trips: readArray<TripDocument>(dataValue.trips, "data.trips"),
    stops: readArray<StopDocument>(dataValue.stops, "data.stops"),
    accommodations: readArray<AccommodationDocument>(
      dataValue.accommodations,
      "data.accommodations",
    ),
    transports: readArray<TransportDocument>(
      dataValue.transports,
      "data.transports",
    ),
    expenses:
      dataValue.expenses === undefined
        ? []
        : readArray<ExpenseDocument>(dataValue.expenses, "data.expenses"),
    settings: readArray<UserSettingsDocument>(dataValue.settings, "data.settings"),
  };

  if (data.settings.length !== 1 || data.settings[0]?.id !== USER_SETTINGS_ID) {
    throw new Error("Invalid export format: data.settings");
  }

  const [
    previousTrips,
    previousStops,
    previousAccommodations,
    previousTransports,
    previousExpenses,
    previousSettings,
  ] = await Promise.all([
    db.trips.find().exec(),
    db.stops.find().exec(),
    db.accommodations.find().exec(),
    db.transports.find().exec(),
    db.expenses.find().exec(),
    db.settings.find().exec(),
  ]);

  const previous = {
    trips: previousTrips.map((doc) => doc.toJSON()),
    stops: previousStops.map((doc) => doc.toJSON()),
    accommodations: previousAccommodations.map((doc) => doc.toJSON()),
    transports: previousTransports.map((doc) => doc.toJSON()),
    expenses: previousExpenses.map((doc) => doc.toJSON()),
    settings: previousSettings.map((doc) => doc.toJSON()),
  };

  try {
    await clearAllCollections(db);
    await upsertAllCollections(db, data);
  } catch (error) {
    await clearAllCollections(db);
    await upsertAllCollections(db, previous);
    throw error;
  }

  const preferencesValue = parsed.preferences;
  const themeValue =
    isObject(preferencesValue) && typeof preferencesValue.theme === "string"
      ? preferencesValue.theme
      : null;
  const theme = isValidTheme(themeValue) ? themeValue : null;

  return { theme };
}

export async function resetAppData(db: MyDatabase) {
  await clearAllCollections(db);
  await db.settings.upsert({
    id: USER_SETTINGS_ID,
    defaultCurrency: "USD",
    language: "en",
    timezone: detectBrowserTimezone(),
    dateFormat: detectBrowserDateFormat(),
  });
}

async function clearAllCollections(db: MyDatabase) {
  await db.transports.find().remove();
  await db.expenses.find().remove();
  await db.accommodations.find().remove();
  await db.stops.find().remove();
  await db.trips.find().remove();
  await db.settings.find().remove();
}

async function upsertAllCollections(
  db: MyDatabase,
  data: AppDataExport["data"],
) {
  if (data.trips.length > 0) {
    await db.trips.bulkUpsert(data.trips);
  }
  if (data.stops.length > 0) {
    await db.stops.bulkUpsert(data.stops);
  }
  if (data.accommodations.length > 0) {
    await db.accommodations.bulkUpsert(data.accommodations);
  }
  if (data.transports.length > 0) {
    await db.transports.bulkUpsert(data.transports);
  }
  if (data.expenses.length > 0) {
    await db.expenses.bulkUpsert(data.expenses);
  }
  if (data.settings.length > 0) {
    await db.settings.bulkUpsert(data.settings);
  }
}

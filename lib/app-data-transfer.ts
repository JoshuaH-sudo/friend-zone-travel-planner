import { MyDatabase } from "@/lib/rxdb-database";
import {
  AccommodationDocument,
  ExpenseDocument,
  StopDocument,
  TransportDocument,
  TripDocument,
  USER_SETTINGS_ID,
  UserSettingsDocument,
  DateFormat,
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

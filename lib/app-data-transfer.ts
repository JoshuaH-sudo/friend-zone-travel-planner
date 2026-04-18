import { MyDatabase } from "@/lib/rxdb-database";
import {
  AccommodationDocument,
  StopDocument,
  TransportDocument,
  TripDocument,
  UserSettingsDocument,
} from "@/lib/rxdb-schema";

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
    settings: UserSettingsDocument[];
  };
};

export async function exportAppData(
  db: MyDatabase,
  preferences: AppDataExport["preferences"],
) {
  const [trips, stops, accommodations, transports, settings] = await Promise.all([
    db.trips.find().exec(),
    db.stops.find().exec(),
    db.accommodations.find().exec(),
    db.transports.find().exec(),
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

export function isValidTheme(value: unknown): value is AllowedThemeValue {
  return ALLOWED_THEME_VALUES.includes(value as AllowedThemeValue);
}

function readArray<T>(value: unknown, key: string): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid export format: ${key}`);
  }
  if (!value.every((item) => isObject(item))) {
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
    settings: readArray<UserSettingsDocument>(dataValue.settings, "data.settings"),
  };

  const previous = {
    trips: (await db.trips.find().exec()).map((doc) => doc.toJSON()),
    stops: (await db.stops.find().exec()).map((doc) => doc.toJSON()),
    accommodations: (await db.accommodations.find().exec()).map((doc) =>
      doc.toJSON(),
    ),
    transports: (await db.transports.find().exec()).map((doc) => doc.toJSON()),
    settings: (await db.settings.find().exec()).map((doc) => doc.toJSON()),
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

async function clearAllCollections(db: MyDatabase) {
  await db.transports.find().remove();
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
  if (data.settings.length > 0) {
    await db.settings.bulkUpsert(data.settings);
  }
}

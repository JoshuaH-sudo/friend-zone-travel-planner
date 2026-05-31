import { RxJsonSchema, RxDocument, RxCollection } from "rxdb";
import { allCurrencyCodes } from "@/lib/constants/currencies";

type Currency = string;

const TransportType = ["flight", "bus", "car", "train"] as const;
type TransportType = (typeof TransportType)[number];

// Document types
export type TripDocument = {
  id: string;
  name: string;
  budget?: number;
  status?: "planning" | "booked" | "completed";
  activeRouteId?: string;
  /** Optional trip start date ("YYYY-MM-DD"). Used to shift all item dates as a unit. */
  startDate?: string;
  /** Optional trip start location. */
  startLocation?: string;
  /** Optional CSS colour value used as the trip banner background (e.g. "#2d6a4f"). */
  bannerColor?: string;
  createdAt: number;
  updatedAt: number;
};

export type StopDocument = {
  id: string;
  name: string;
  tripId: string;
  routeId?: string;
  createdAt: number;
  updatedAt: number;
};

export type AccommodationDocument = {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  checkIn: string;
  checkOut: string;
  timezone?: string;
  stopId: string;
  routeId?: string;
  createdAt: number;
  updatedAt: number;
};

export type TransportDocument = {
  id: string;
  name: string;
  type: TransportType;
  price: number;
  currency: Currency;
  /** ISO datetime string "YYYY-MM-DDTHH:MM" for the departure; replaces the old `date` field. */
  departureDateTime: string;
  /** ISO datetime string "YYYY-MM-DDTHH:MM" for the arrival (optional). */
  arrivalDateTime?: string;
  timezone?: string;
  stopId: string;
  routeId?: string;
  createdAt: number;
  updatedAt: number;
};

export type ExpenseDocument = {
  id: string;
  tripId: string;
  category: "food" | "activity" | "shopping" | "other";
  description?: string;
  price: number;
  currency: Currency;
  createdAt: number;
  updatedAt: number;
  stopId: string;
  routeId?: string;
  name: string;
  date?: string;
};

export type RouteCompareWeights = {
  cost: number;
  duration: number;
  travel: number;
  events: number;
};

export type RouteDocument = {
  id: string;
  tripId: string;
  name: string;
  color: string;
  createdAt: number;
  updatedAt: number;
};

export type RouteStopIntelItem = {
  name: string;
  date: string;
};

export type RouteStopDocument = {
  id: string;
  tripId: string;
  routeId: string;
  name: string;
  order: number;
  startDate?: string;
  endDate?: string;
  latitude?: number;
  longitude?: number;
  countryCode?: string;
  timezone?: string;
  intel?: {
    fetchedAt: number;
    items: RouteStopIntelItem[];
  };
  createdAt: number;
  updatedAt: number;
};

export type RoutePreferenceDocument = {
  id: string;
  tripId: string;
  routeId: string;
  weights: RouteCompareWeights;
  createdAt: number;
  updatedAt: number;
};

export type DateFormat = "MM/dd/yyyy" | "dd/MM/yyyy" | "yyyy-MM-dd";

export const TRIP_START_LOCATION_MAX_LENGTH = 200;

export const dateFormats: DateFormat[] = [
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "yyyy-MM-dd",
];

export type UserSettingsDocument = {
  id: string;
  defaultCurrency: string;
  language: string;
  timezone: string;
  dateFormat: DateFormat;
  compareWeights?: RouteCompareWeights;
  analyticsConsent?: boolean;
  cookiesConsent?: boolean;
};

// RxDB Schemas
export const tripSchema: RxJsonSchema<TripDocument> = {
  version: 5,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    budget: {
      type: "number",
      multipleOf: 0.01,
      minimum: 0,
      maximum: 100000000,
    },
    status: {
      type: "string",
      enum: ["planning", "booked", "completed"],
    },
    activeRouteId: {
      type: "string",
      maxLength: 100,
    },
    startDate: {
      type: "string",
      maxLength: 10,
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
    },
    startLocation: {
      type: "string",
      maxLength: TRIP_START_LOCATION_MAX_LENGTH,
    },
    bannerColor: {
      type: "string",
      maxLength: 30,
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
  },
  required: ["id", "name", "createdAt", "updatedAt"],
  indexes: ["createdAt"],
};

export const stopSchema: RxJsonSchema<StopDocument> = {
  version: 2,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    tripId: {
      type: "string",
      maxLength: 100,
      ref: "trips",
    },
    routeId: {
      type: "string",
      maxLength: 100,
      ref: "routes",
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
  },
  required: ["id", "name", "tripId", "createdAt", "updatedAt"],
  indexes: ["tripId"],
};

export const accommodationSchema: RxJsonSchema<AccommodationDocument> = {
  version: 2,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    price: {
      type: "number",
      multipleOf: 0.01,
      minimum: 0,
      maximum: 1000000,
    },
    currency: {
      type: "string",
      enum: allCurrencyCodes,
    },
    checkIn: {
      type: "string",
      maxLength: 100,
    },
    checkOut: {
      type: "string",
      maxLength: 100,
    },
    timezone: {
      type: "string",
      maxLength: 100,
    },
    stopId: {
      type: "string",
      maxLength: 100,
      ref: "stops",
    },
    routeId: {
      type: "string",
      maxLength: 100,
      ref: "routes",
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
  },
  required: [
    "id",
    "name",
    "price",
    "currency",
    "checkIn",
    "checkOut",
    "stopId",
    "createdAt",
    "updatedAt",
  ],
  indexes: ["stopId", "checkIn"],
};

export const transportSchema: RxJsonSchema<TransportDocument> = {
  version: 3,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    type: {
      type: "string",
      enum: TransportType,
    },
    price: {
      type: "number",
      multipleOf: 0.01,
      minimum: 0,
      maximum: 1000000,
    },
    currency: {
      type: "string",
      enum: allCurrencyCodes,
    },
    departureDateTime: {
      type: "string",
      maxLength: 20,
    },
    arrivalDateTime: {
      type: "string",
      maxLength: 20,
    },
    timezone: {
      type: "string",
      maxLength: 100,
    },
    stopId: {
      type: "string",
      maxLength: 100,
      ref: "stops",
    },
    routeId: {
      type: "string",
      maxLength: 100,
      ref: "routes",
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
  },
  required: [
    "id",
    "name",
    "type",
    "price",
    "currency",
    "departureDateTime",
    "stopId",
    "createdAt",
    "updatedAt",
  ],
  indexes: ["stopId", "departureDateTime"],
};

export const expenseSchema: RxJsonSchema<ExpenseDocument> = {
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    tripId: {
      type: "string",
      maxLength: 100,
      ref: "trips",
    },
    category: {
      type: "string",
      enum: ["food", "activity", "shopping", "other"],
    },
    description: {
      type: "string",
      maxLength: 300,
    },
    price: {
      type: "number",
      multipleOf: 0.01,
      minimum: 0,
      maximum: 1000000,
    },
    currency: {
      type: "string",
      enum: allCurrencyCodes,
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    name: {
      type: "string",
      maxLength: 200,
    },
    date: {
      type: "string",
      maxLength: 100,
    },
    stopId: {
      type: "string",
      maxLength: 100,
      ref: "stops",
    },
    routeId: {
      type: "string",
      maxLength: 100,
      ref: "routes",
    },
  },
  required: [
    "id",
    "tripId",
    "stopId",
    "name",
    "price",
    "currency",
    "createdAt",
    "updatedAt",
  ],
  indexes: ["tripId"],
};

export const routeSchema: RxJsonSchema<RouteDocument> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 100 },
    tripId: { type: "string", maxLength: 100, ref: "trips" },
    name: { type: "string", maxLength: 120 },
    color: { type: "string", maxLength: 30 },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
  },
  required: ["id", "tripId", "name", "color", "createdAt", "updatedAt"],
  indexes: ["tripId", "createdAt"],
};

export const routeStopSchema: RxJsonSchema<RouteStopDocument> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 100 },
    tripId: { type: "string", maxLength: 100, ref: "trips" },
    routeId: { type: "string", maxLength: 100, ref: "routes" },
    name: { type: "string", maxLength: 150 },
    order: { type: "number", multipleOf: 1, minimum: 0, maximum: 10000 },
    startDate: { type: "string", maxLength: 10 },
    endDate: { type: "string", maxLength: 10 },
    latitude: { type: "number", minimum: -90, maximum: 90 },
    longitude: { type: "number", minimum: -180, maximum: 180 },
    countryCode: { type: "string", maxLength: 2 },
    timezone: { type: "string", maxLength: 100 },
    intel: {
      type: "object",
      properties: {
        fetchedAt: {
          type: "number",
          multipleOf: 1,
          minimum: 0,
          maximum: 8640000000000000,
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", maxLength: 200 },
              date: { type: "string", maxLength: 30 },
            },
            required: ["name", "date"],
          },
        },
      },
      required: ["fetchedAt", "items"],
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
  },
  required: [
    "id",
    "tripId",
    "routeId",
    "name",
    "order",
    "createdAt",
    "updatedAt",
  ],
  indexes: ["tripId", "routeId", "order"],
};

export const routePreferenceSchema: RxJsonSchema<RoutePreferenceDocument> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 100 },
    tripId: { type: "string", maxLength: 100, ref: "trips" },
    routeId: { type: "string", maxLength: 100, ref: "routes" },
    weights: {
      type: "object",
      properties: {
        cost: { type: "number", minimum: 0, maximum: 1 },
        duration: { type: "number", minimum: 0, maximum: 1 },
        travel: { type: "number", minimum: 0, maximum: 1 },
        events: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["cost", "duration", "travel", "events"],
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 8640000000000000,
    },
  },
  required: ["id", "tripId", "routeId", "weights", "createdAt", "updatedAt"],
  indexes: ["tripId", "routeId"],
};

// RxDocument types
export type TripDocMethods = Record<string, never>;
export type TripDocumentType = RxDocument<TripDocument, TripDocMethods>;

export type StopDocMethods = Record<string, never>;
export type StopDocumentType = RxDocument<StopDocument, StopDocMethods>;

export type AccommodationDocMethods = Record<string, never>;
export type AccommodationDocumentType = RxDocument<
  AccommodationDocument,
  AccommodationDocMethods
>;

export type TransportDocMethods = Record<string, never>;
export type TransportDocumentType = RxDocument<
  TransportDocument,
  TransportDocMethods
>;

export type ExpenseDocMethods = Record<string, never>;
export type ExpenseDocumentType = RxDocument<
  ExpenseDocument,
  ExpenseDocMethods
>;

export type RouteDocMethods = Record<string, never>;
export type RouteDocumentType = RxDocument<RouteDocument, RouteDocMethods>;

export type RouteStopDocMethods = Record<string, never>;
export type RouteStopDocumentType = RxDocument<
  RouteStopDocument,
  RouteStopDocMethods
>;

export type RoutePreferenceDocMethods = Record<string, never>;
export type RoutePreferenceDocumentType = RxDocument<
  RoutePreferenceDocument,
  RoutePreferenceDocMethods
>;

// RxCollection types
export type TripCollectionMethods = Record<string, never>;
export type TripCollection = RxCollection<
  TripDocument,
  TripDocMethods,
  TripCollectionMethods
>;

export type StopCollectionMethods = Record<string, never>;
export type StopCollection = RxCollection<
  StopDocument,
  StopDocMethods,
  StopCollectionMethods
>;

export type AccommodationCollectionMethods = Record<string, never>;
export type AccommodationCollection = RxCollection<
  AccommodationDocument,
  AccommodationDocMethods,
  AccommodationCollectionMethods
>;

export type TransportCollectionMethods = Record<string, never>;
export type TransportCollection = RxCollection<
  TransportDocument,
  TransportDocMethods,
  TransportCollectionMethods
>;

export type ExpenseCollectionMethods = Record<string, never>;
export type ExpenseCollection = RxCollection<
  ExpenseDocument,
  ExpenseDocMethods,
  ExpenseCollectionMethods
>;

export type RouteCollectionMethods = Record<string, never>;
export type RouteCollection = RxCollection<
  RouteDocument,
  RouteDocMethods,
  RouteCollectionMethods
>;

export type RouteStopCollectionMethods = Record<string, never>;
export type RouteStopCollection = RxCollection<
  RouteStopDocument,
  RouteStopDocMethods,
  RouteStopCollectionMethods
>;

export type RoutePreferenceCollectionMethods = Record<string, never>;
export type RoutePreferenceCollection = RxCollection<
  RoutePreferenceDocument,
  RoutePreferenceDocMethods,
  RoutePreferenceCollectionMethods
>;

export const USER_SETTINGS_ID = "user-settings";

export const userSettingsSchema: RxJsonSchema<UserSettingsDocument> = {
  version: 4,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    defaultCurrency: {
      type: "string",
      enum: allCurrencyCodes,
    },
    language: {
      type: "string",
      maxLength: 10,
    },
    timezone: {
      type: "string",
      maxLength: 100,
    },
    dateFormat: {
      type: "string",
      enum: dateFormats,
    },
    compareWeights: {
      type: "object",
      properties: {
        cost: { type: "number", minimum: 0, maximum: 1 },
        duration: { type: "number", minimum: 0, maximum: 1 },
        travel: { type: "number", minimum: 0, maximum: 1 },
        events: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["cost", "duration", "travel", "events"],
    },
    analyticsConsent: {
      type: "boolean",
    },
    cookiesConsent: {
      type: "boolean",
    },
  },
  required: ["id", "defaultCurrency", "language", "timezone", "dateFormat"],
};

export type UserSettingsDocMethods = Record<string, never>;
export type UserSettingsDocumentType = RxDocument<
  UserSettingsDocument,
  UserSettingsDocMethods
>;

export type UserSettingsCollectionMethods = Record<string, never>;
export type UserSettingsCollection = RxCollection<
  UserSettingsDocument,
  UserSettingsDocMethods,
  UserSettingsCollectionMethods
>;

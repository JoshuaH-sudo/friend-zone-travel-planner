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
  /** Optional trip start date ("YYYY-MM-DD"). Used to shift all item dates as a unit. */
  startDate?: string;
  createdAt: number;
  updatedAt: number;
};

export type StopDocument = {
  id: string;
  name: string;
  tripId: string;
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
  name: string;
  date?: string;
};

export type DateFormat = "MM/dd/yyyy" | "dd/MM/yyyy" | "yyyy-MM-dd";

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
};

// RxDB Schemas
export const tripSchema: RxJsonSchema<TripDocument> = {
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
    budget: {
      type: "number",
      multipleOf: 0.01,
      minimum: 0,
      maximum: 100000000,
    },
    startDate: {
      type: "string",
      maxLength: 10,
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
  version: 1,
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
  version: 1,
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
  version: 0,
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
export type ExpenseDocumentType = RxDocument<ExpenseDocument, ExpenseDocMethods>;

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

export const USER_SETTINGS_ID = "user-settings";

export const userSettingsSchema: RxJsonSchema<UserSettingsDocument> = {
  version: 2,
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

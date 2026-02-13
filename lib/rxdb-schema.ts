import { RxJsonSchema, RxDocument, RxCollection } from "rxdb";

const Currency = ["USD", "EUR", "JPY", "AUD"] as const;
type Currency = (typeof Currency)[number];

const TransportType = ["flight", "bus", "car", "train"] as const;
type TransportType = (typeof TransportType)[number];

// Document types
export type TripDocument = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type StopDocument = {
  id: string;
  name: string;
  date: string;
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
  date: string;
  stopId: string;
  createdAt: number;
  updatedAt: number;
};

// RxDB Schemas
export const tripSchema: RxJsonSchema<TripDocument> = {
  version: 0,
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
  version: 0,
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
    date: {
      type: "string",
      maxLength: 100,
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
  required: ["id", "name", "date", "tripId", "createdAt", "updatedAt"],
  indexes: ["tripId", "date"],
};

export const accommodationSchema: RxJsonSchema<AccommodationDocument> = {
  version: 0,
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
      enum: ["USD", "EUR", "JPY", "AUD"],
    },
    checkIn: {
      type: "string",
      maxLength: 100,
    },
    checkOut: {
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
  version: 0,
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
      enum: Currency,
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
    "date",
    "stopId",
    "createdAt",
    "updatedAt",
  ],
  indexes: ["stopId", "date"],
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

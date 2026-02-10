import { RxJsonSchema } from "rxdb";

export const tripSchema: RxJsonSchema<any> = {
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
    },
    updatedAt: {
      type: "number",
    },
  },
  required: ["id", "name", "createdAt", "updatedAt"],
  indexes: ["createdAt"],
};

export const stopSchema: RxJsonSchema<any> = {
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
    },
    tripId: {
      type: "string",
      ref: "trips",
    },
    createdAt: {
      type: "number",
    },
    updatedAt: {
      type: "number",
    },
  },
  required: ["id", "name", "date", "tripId", "createdAt", "updatedAt"],
  indexes: ["tripId", "date"],
};

export const accommodationSchema: RxJsonSchema<any> = {
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
    },
    currency: {
      type: "string",
    },
    checkIn: {
      type: "string",
    },
    checkOut: {
      type: "string",
    },
    stopId: {
      type: "string",
      ref: "stops",
    },
    createdAt: {
      type: "number",
    },
    updatedAt: {
      type: "number",
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

export const transportSchema: RxJsonSchema<any> = {
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
    },
    price: {
      type: "number",
    },
    currency: {
      type: "string",
    },
    date: {
      type: "string",
    },
    stopId: {
      type: "string",
      ref: "stops",
    },
    createdAt: {
      type: "number",
    },
    updatedAt: {
      type: "number",
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
  currency: string;
  checkIn: string;
  checkOut: string;
  stopId: string;
  createdAt: number;
  updatedAt: number;
};

export type TransportDocument = {
  id: string;
  name: string;
  type: string;
  price: number;
  currency: string;
  date: string;
  stopId: string;
  createdAt: number;
  updatedAt: number;
};

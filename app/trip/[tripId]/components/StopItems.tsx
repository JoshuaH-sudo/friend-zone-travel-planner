"use client";
import {
  TransportDocumentType,
  AccommodationDocumentType,
  StopDocumentType,
} from "@/lib/rxdb-schema";
import { Accommodation } from "./Accommodation";
import { Transport } from "./Transport";

interface StopItemsProps {
  transports: TransportDocumentType[];
  accommodations: AccommodationDocumentType[];
  stop: StopDocumentType;
  onAddAccommodation: (stopId: string) => Promise<void>;
  onAddTransport: (stopId: string) => Promise<void>;
  onItemsChange: () => Promise<void>;
}

export function StopItems({
  transports,
  accommodations,
  stop,
  onAddAccommodation,
  onAddTransport,
  onItemsChange,
}: StopItemsProps) {
  const items = [
    ...transports.map((trans) => ({
      model: trans,
      id: trans.id,
      type: "transport" as const,
      date: trans.date,
    })),
    ...accommodations.map((acc) => ({
      model: acc,
      id: acc.id,
      type: "accommodation" as const,
      date: acc.checkIn,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="mt-4 ml-6 space-y-3">
      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) =>
            item.type === "accommodation" ? (
              <li key={item.id}>
                <Accommodation
                  accommodation={item.model}
                  onItemsChange={onItemsChange}
                />
              </li>
            ) : (
              <li key={item.id}>
                <Transport
                  transport={item.model}
                  onItemsChange={onItemsChange}
                />
              </li>
            ),
          )}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <button
          className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
          onClick={() => onAddAccommodation(stop.id)}
        >
          Add Accommodation
        </button>
        <button
          className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
          onClick={() => onAddTransport(stop.id)}
        >
          Add Transport
        </button>
      </div>
    </div>
  );
}

"use client";
import {
  TransportDocumentType,
  AccommodationDocumentType,
  StopDocumentType,
} from "@/lib/rxdb-schema";
import { Accommodation } from "./Accommodation";
import { Transport } from "./Transport";
import { Timeline } from "./Timeline";
import { Button } from "@/components/ui/button";
import { Hotel, Plane, Bus, Car, Train, Dot } from "lucide-react";

interface StopItemsProps {
  transports: TransportDocumentType[];
  accommodations: AccommodationDocumentType[];
  stop: StopDocumentType;
  onAddAccommodation: (stopId: string) => Promise<void>;
  onAddTransport: (stopId: string) => Promise<void>;
}

export function StopItems({
  transports,
  accommodations,
  stop,
  onAddAccommodation,
  onAddTransport,
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

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-4 w-4" />;
      case "bus":
        return <Bus className="h-4 w-4" />;
      case "car":
        return <Car className="h-4 w-4" />;
      case "train":
        return <Train className="h-4 w-4" />;
      default:
        return <Plane className="h-4 w-4" />;
    }
  };

  return (
    <div className="mt-4 ml-6 space-y-3">
      {items.length > 0 && (
        <Timeline
          className="ml-3"
          lineClassName="absolute top-4 bottom-0 left-0 border-l-2"
          endMarker={
            <div className="bg-background border-primary absolute -bottom-2 left-0 flex size-4 -translate-x-1/2 items-center justify-center rounded-full border-2">
              <Dot className="text-foreground h-8 w-8" />
            </div>
          }
        >
          <ul className="space-y-6">
            {items.map((item) => (
              <li key={item.id} className="relative pl-8">
                <div
                  id={`item-icon-${item.id}`}
                  className="bg-background border-primary absolute top-3 left-px flex size-7 shrink-0 -translate-x-1/2 items-center justify-center rounded-full border-2"
                >
                  {item.type === "accommodation" ? (
                    <Hotel className="text-foreground h-4 w-4" />
                  ) : (
                    <span className="text-foreground">
                      {getTransportIcon(
                        (item.model as TransportDocumentType).type,
                      )}
                    </span>
                  )}
                </div>
                <div>
                  {item.type === "accommodation" ? (
                    <Accommodation accommodation={item.model} />
                  ) : (
                    <Transport transport={item.model} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Timeline>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddAccommodation(stop.id)}
        >
          Add Accommodation
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddTransport(stop.id)}
        >
          Add Transport
        </Button>
      </div>
    </div>
  );
}

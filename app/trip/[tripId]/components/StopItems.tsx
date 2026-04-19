"use client";
import {
  TransportDocumentType,
  AccommodationDocumentType,
  StopDocumentType,
} from "@/lib/rxdb-schema";
import { useTranslations } from "next-intl";
import { Accommodation } from "./Accommodation";
import { Transport } from "./Transport";
import { Timeline } from "./Timeline";
import { Button } from "@/components/ui/button";
import { Hotel, Plane, Bus, Car, Train, Dot } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Hotel01Icon, PlaneTakeoff, Plus } from "@hugeicons/core-free-icons";

interface StopItemsProps {
  transports: TransportDocumentType[];
  accommodations: AccommodationDocumentType[];
  stop: StopDocumentType;
  onAddAccommodation: (stopId: string) => Promise<void>;
  onAddTransport: (stopId: string) => Promise<void>;
  pendingNewAccommodationId?: string | null;
  pendingNewTransportId?: string | null;
}

export function StopItems({
  transports,
  accommodations,
  stop,
  onAddAccommodation,
  onAddTransport,
  pendingNewAccommodationId,
  pendingNewTransportId,
}: StopItemsProps) {
  const t = useTranslations("stopItems");
  type TripItem = {
    model: TransportDocumentType | AccommodationDocumentType;
    id: string;
    type: "transport" | "accommodation";
    date: string;
  };

  const getItemRange = (item: TripItem) => {
    if (item.type === "accommodation") {
      const accommodation = item.model as AccommodationDocumentType;
      return { start: accommodation.checkIn, end: accommodation.checkOut };
    }

    const transport = item.model as TransportDocumentType;
    return {
      start: transport.departureDateTime,
      end: transport.arrivalDateTime || transport.departureDateTime,
    };
  };

  const formatDateLabel = (value: string) => {
    const date = new Date(value);
    if (value.includes("T")) {
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRangeLabel = (start: string, end: string) => {
    if (start === end) {
      return formatDateLabel(start);
    }

    return t("dateRangeSummary", {
      start: formatDateLabel(start),
      end: formatDateLabel(end),
    });
  };

  const items: TripItem[] = [
    ...transports.map((trans) => ({
      model: trans,
      id: trans.id,
      type: "transport" as const,
      date: trans.departureDateTime,
    })),
    ...accommodations.map((acc) => ({
      model: acc,
      id: acc.id,
      type: "accommodation" as const,
      date: acc.checkIn,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const overlapWarnings: Record<string, string[]> = {};
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const first = items[i];
      const second = items[j];
      const firstRange = getItemRange(first);
      const secondRange = getItemRange(second);

      const firstStartTime = new Date(firstRange.start).getTime();
      const firstEndTime = new Date(firstRange.end).getTime();
      const secondStartTime = new Date(secondRange.start).getTime();
      const secondEndTime = new Date(secondRange.end).getTime();
      const overlaps =
        firstStartTime <= secondEndTime && secondStartTime <= firstEndTime;

      if (!overlaps) {
        continue;
      }

      const overlapStart = new Date(Math.max(firstStartTime, secondStartTime));
      const overlapEnd = new Date(Math.min(firstEndTime, secondEndTime));

      overlapWarnings[first.id] = [
        ...(overlapWarnings[first.id] || []),
        t("overlapWarningSummary", {
          item: first.model.name,
          other: second.model.name,
          range: formatRangeLabel(
            overlapStart.toISOString(),
            overlapEnd.toISOString(),
          ),
        }),
      ];

      overlapWarnings[second.id] = [
        ...(overlapWarnings[second.id] || []),
        t("overlapWarningSummary", {
          item: second.model.name,
          other: first.model.name,
          range: formatRangeLabel(
            overlapStart.toISOString(),
            overlapEnd.toISOString(),
          ),
        }),
      ];
    }
  }

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
          className="ml-0.5"
          lineClassName="absolute top-4 bottom-0 left-0 border-l-2"
          endMarker={
            <div className="bg-background border-primary absolute -bottom-2 left-0 flex size-4 -translate-x-1/2 items-center justify-center rounded-full border-2">
              <Dot className="text-foreground h-8 w-8" />
            </div>
          }
        >
          <ul className="space-y-6">
            {items.map((item) => (
              <li
                id={`trip-item-${item.id}`}
                key={item.id}
                className="relative pl-8"
              >
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
                    <Accommodation
                      accommodation={item.model as AccommodationDocumentType}
                      startInEditMode={pendingNewAccommodationId === item.id}
                      warningSummary={overlapWarnings[item.id]?.join(" • ")}
                      highlightedDates={items
                        .filter((otherItem) => otherItem.id !== item.id)
                        .flatMap((otherItem) => {
                          const range = getItemRange(otherItem);
                          return [range.start, range.end];
                        })}
                    />
                  ) : (
                    <Transport
                      transport={item.model as TransportDocumentType}
                      startInEditMode={pendingNewTransportId === item.id}
                      warningSummary={overlapWarnings[item.id]?.join(" • ")}
                      highlightedDates={items
                        .filter((otherItem) => otherItem.id !== item.id)
                        .flatMap((otherItem) => {
                          const range = getItemRange(otherItem);
                          return [range.start, range.end];
                        })}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Timeline>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddAccommodation(stop.id)}
        >
          <HugeiconsIcon icon={Hotel01Icon} /> {t("accommodation")}
          <HugeiconsIcon icon={Plus} className="ml-1" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAddTransport(stop.id)}
        >
          <HugeiconsIcon icon={PlaneTakeoff} /> {t("transport")}
          <HugeiconsIcon icon={Plus} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

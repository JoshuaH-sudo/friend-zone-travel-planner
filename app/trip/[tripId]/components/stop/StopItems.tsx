"use client";
import {
  TransportDocumentType,
  AccommodationDocumentType,
  StopDocumentType,
} from "@/lib/rxdb-schema";
import { useTranslations } from "next-intl";
import { Accommodation } from "../accommodation/Accommodation";
import { Transport } from "../transport/Transport";
import { Timeline } from "../shared/Timeline";
import { Button } from "@/components/ui/button";
import { Hotel, Dot } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Hotel01Icon, PlaneTakeoff, Plus } from "@hugeicons/core-free-icons";
import {
  useItemOverlapDetection,
  useSortedTripItems,
  getItemRange,
} from "../hooks/useItemOverlapDetection";
import { getTransportIcon } from "../utils/transportUtils";

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

  const items = useSortedTripItems(accommodations, transports);
  const overlapWarnings = useItemOverlapDetection(accommodations, transports);

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



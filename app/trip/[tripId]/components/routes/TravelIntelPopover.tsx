"use client";

import { useQuery } from "@tanstack/react-query";
import {
  PopoverRoot,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getRouteStopIntel } from "@/lib/enrichment/route-stop-intel";
import { RouteStopDocumentType } from "@/lib/rxdb-schema";
import { useTranslations } from "next-intl";

type TravelIntelPopoverProps = {
  routeStop: RouteStopDocumentType;
};

export function TravelIntelPopover({ routeStop }: TravelIntelPopoverProps) {
  const t = useTranslations("routeEditor");
  const intelQuery = useQuery({
    queryKey: ["route-stop-intel", routeStop.id, routeStop.updatedAt],
    queryFn: () => getRouteStopIntel(routeStop),
    enabled: Boolean(routeStop.countryCode),
  });

  return (
    <PopoverRoot>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm">
            {t("intel")}
          </Button>
        }
      />
      <PopoverContent className="w-72">
        {!routeStop.countryCode ? (
          <p className="text-muted-foreground text-sm">
            {t("intelMissingLocation")}
          </p>
        ) : intelQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">{t("loading")}</p>
        ) : intelQuery.data && intelQuery.data.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {intelQuery.data.map((item) => (
              <li
                key={`${item.date}-${item.name}`}
                className="flex justify-between gap-3"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground">{item.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">{t("intelEmpty")}</p>
        )}
      </PopoverContent>
    </PopoverRoot>
  );
}

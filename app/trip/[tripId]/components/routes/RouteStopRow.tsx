"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteStopDocumentType } from "@/lib/rxdb-schema";
import { LocationPicker } from "./LocationPicker";
import { TravelIntelPopover } from "./TravelIntelPopover";
import { useTranslations } from "next-intl";

type RouteStopRowProps = {
  routeStop: RouteStopDocumentType;
};

export function RouteStopRow({ routeStop }: RouteStopRowProps) {
  const t = useTranslations("routeEditor");
  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">
          {routeStop.order + 1}. {routeStop.name}
        </p>
        <div className="flex items-center gap-1">
          <TravelIntelPopover routeStop={routeStop} />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => routeStop.remove()}
          >
            {t("delete")}
          </Button>
        </div>
      </div>

      <LocationPicker
        initialValue={routeStop.name}
        onResolved={async ({ name, latitude, longitude, countryCode }) => {
          await routeStop.patch({
            name,
            latitude,
            longitude,
            countryCode,
            updatedAt: Date.now(),
          });
        }}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          type="date"
          value={routeStop.startDate ?? ""}
          onChange={async (event) => {
            await routeStop.patch({
              startDate: event.target.value || undefined,
              updatedAt: Date.now(),
            });
          }}
        />
        <Input
          type="date"
          value={routeStop.endDate ?? ""}
          onChange={async (event) => {
            await routeStop.patch({
              endDate: event.target.value || undefined,
              updatedAt: Date.now(),
            });
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteDocumentType, RouteStopDocumentType } from "@/lib/rxdb-schema";
import { MyDatabase, generateId } from "@/lib/rxdb-database";
import {
  activateRoute,
  createRoute,
  deleteRoute,
  duplicateRoute,
  reorderRouteStops,
} from "@/lib/routes/service";
import { RouteStopRow } from "./RouteStopRow";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type RouteEditorProps = {
  db: MyDatabase;
  tripId: string;
  routes: RouteDocumentType[];
  routeStops: RouteStopDocumentType[];
  activeRouteId: string;
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
};

export function RouteEditor({
  db,
  tripId,
  routes,
  routeStops,
  activeRouteId,
  selectedRouteId,
  onSelectRoute,
}: RouteEditorProps) {
  const t = useTranslations("routeEditor");
  const [newRouteName, setNewRouteName] = useState("");
  const [newStopName, setNewStopName] = useState("");

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId),
    [routes, selectedRouteId],
  );

  return (
    <section className="space-y-4 rounded-2xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isActive = activeRouteId === route.id;
          return (
            <Button
              key={route.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onSelectRoute(route.id)}
              className="gap-2"
              style={{ borderColor: route.color }}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: route.color }}
              />
              {route.name}
              {isActive ? `(${t("active")})` : ""}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          value={newRouteName}
          onChange={(event) => setNewRouteName(event.target.value)}
          placeholder={t("newRoutePlaceholder")}
          className="max-w-xs"
        />
        <Button
          type="button"
          onClick={async () => {
            const route = await createRoute(db, tripId, {
              name: newRouteName.trim() || `Route ${routes.length + 1}`,
              sourceRouteId: selectedRouteId,
            });
            setNewRouteName("");
            onSelectRoute(route.id);
          }}
        >
          {t("addRoute")}
        </Button>
        {selectedRoute ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await duplicateRoute(db, tripId, selectedRoute.id);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : t("actionFailed"),
                  );
                }
              }}
            >
              {t("duplicate")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await activateRoute(db, tripId, selectedRoute.id);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : t("actionFailed"),
                  );
                }
              }}
            >
              {t("setActive")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteRoute(db, tripId, selectedRoute.id);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : t("actionFailed"),
                  );
                }
              }}
            >
              {t("delete")}
            </Button>
          </>
        ) : null}
      </div>

      {selectedRoute ? (
        <>
          <div className="flex gap-2">
            <Input
              value={newStopName}
              onChange={(event) => setNewStopName(event.target.value)}
              placeholder={t("newStopPlaceholder")}
              className="max-w-xs"
            />
            <Button
              type="button"
              onClick={async () => {
                if (!newStopName.trim()) return;
                await db.route_stops.insert({
                  id: generateId(),
                  tripId,
                  routeId: selectedRoute.id,
                  name: newStopName.trim(),
                  order: routeStops.length,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
                setNewStopName("");
              }}
            >
              {t("addStop")}
            </Button>
          </div>

          <div className="space-y-2">
            {routeStops.map((routeStop) => (
              <RouteStopRow key={routeStop.id} routeStop={routeStop} />
            ))}
          </div>

          {routeStops.length > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const reordered = [...routeStops]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((stop) => stop.id);
                reorderRouteStops(routeStops, reordered);
              }}
            >
              {t("sortStops")}
            </Button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

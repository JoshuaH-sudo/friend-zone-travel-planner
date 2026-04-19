"use client";

import Link from "next/link";
import { getDatabase, MyDatabase } from "@/lib/rxdb-database";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TripDocument } from "@/lib/rxdb-schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { PlusIcon } from "lucide-react";
import { TripStats } from "./trip/[tripId]/components/TripStats";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CalendarDownload01Icon,
} from "@hugeicons/core-free-icons";
import { exportTripToIcal } from "@/lib/ical-export";
import { useSettings } from "@/lib/SettingsProvider";

function TripList() {
  const router = useRouter();
  const t = useTranslations("home");
  const [trips, setTrips] = useState<TripDocument[]>([]);
  const [database, setDatabase] = useState<MyDatabase | null>(null);
  const { timezone } = useSettings();

  useEffect(() => {
    const fetchDatabase = async () => {
      const db = await getDatabase();
      setDatabase(db);
    };
    fetchDatabase();
  }, []);

  useEffect(() => {
    if (!database) return;

    const subscription = database.trips.find().$.subscribe((newTrips) => {
      setTrips(newTrips);
    });

    return () => subscription.unsubscribe();
  }, [database]);

  const createTrip = async () => {
    if (!database) return;

    const { generateId } = await import("@/lib/rxdb-database");
    const newTrip = await database.trips.insert({
      id: generateId(),
      name: t("newTripName"),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("Created new trip:", newTrip);
    router.push(`/trip/${newTrip.id}`);
  };

  const deleteTrip = async (tripId: string) => {
    if (!database) return;

    const trip = await database.trips.findOne(tripId).exec();
    if (trip) {
      await trip.remove();
      console.log("Deleted trip:", tripId);
    }
  };

  const exportTrip = async (tripId: string) => {
    if (!database) return;
    await exportTripToIcal(database, tripId, timezone);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{t("yourTrips")}</h2>
        <Button
          variant="outline"
          className="bg-accent text-accent-foreground"
          onClick={createTrip}
        >
          {t("addTrip")}
          <PlusIcon />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {trips.map((trip) => (
          <Card
            key={trip.id}
            className="flex h-full flex-col transition-transform duration-200 hover:scale-[1.01]"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/trip/${trip.id}`}
                  className="hover:text-primary flex-1 text-2xl font-semibold hover:underline"
                >
                  {trip.name}
                </Link>
                <ConfirmationDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10"
                      aria-label={t("deleteTripAriaLabel")}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} />
                    </Button>
                  }
                  title={t("deleteTripTitle")}
                  description={t("deleteTripDescription", {
                    tripName: trip.name,
                  })}
                  confirmLabel={t("deleteTripConfirm")}
                  onConfirm={() => deleteTrip(trip.id)}
                >
                  <p className="text-muted-foreground text-sm">
                    {t("deleteTripWarning")}
                  </p>
                </ConfirmationDialog>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <TripStats tripId={trip.id} />
            </CardContent>

            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/trip/${trip.id}`)}
              >
                {t("openTrip")}
              </Button>
            </CardFooter>
          </Card>
        ))}

        <Card className="bg-muted/50 border-dashed transition-transform duration-200 hover:scale-[1.01]">
          <CardHeader>
            <CardTitle>{t("addNewTripTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {t("addNewTripDescription")}
          </CardContent>
          <CardFooter>
            <Button onClick={createTrip} className="w-full">
              {t("addTrip")}
              <PlusIcon />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function Home() {
  return <TripList />;
}

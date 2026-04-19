"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDatabase } from "@/lib/DatabaseProvider";
import { importSharedTrip } from "@/lib/share";
import { toast } from "sonner";

export function ImportListener() {
  const db = useDatabase();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const encoded = searchParams.get("import");
    if (!encoded) return;

    const shouldImport = window.confirm(
      "Import this shared trip into your local planner?",
    );
    if (!shouldImport) {
      router.replace(pathname);
      return;
    }

    importSharedTrip(db, encoded)
      .then((newTripId) => {
        toast.success("Trip imported.");
        router.replace(`/trip/${newTripId}`);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Import failed.");
        router.replace(pathname);
      });
  }, [db, pathname, router, searchParams]);

  return null;
}

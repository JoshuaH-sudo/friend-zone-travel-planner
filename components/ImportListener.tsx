"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDatabase } from "@/lib/DatabaseProvider";
import { importSharedTrip } from "@/lib/share";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function ImportListener() {
  const db = useDatabase();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("importListener");
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const encoded = searchParams.get("import");
    if (!encoded) return;
    setPendingImport(encoded);
  }, [searchParams]);

  if (!pendingImport) {
    return null;
  }

  return (
    <div className="bg-card border-border fixed right-4 bottom-4 left-4 z-50 rounded-2xl border p-4 shadow-lg md:left-auto md:w-[420px]">
      <p className="text-sm font-medium">{t("title")}</p>
      <p className="text-muted-foreground mt-1 text-sm">
        {t("description")}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={isImporting}
          onClick={() => {
            setPendingImport(null);
            router.replace(pathname);
          }}
        >
          {t("cancel")}
        </Button>
        <Button
          disabled={isImporting}
          onClick={async () => {
            if (!pendingImport) return;
            setIsImporting(true);
            try {
              const newTripId = await importSharedTrip(db, pendingImport);
              toast.success(t("success"));
              setPendingImport(null);
              router.replace(`/trip/${newTripId}`);
            } catch (error) {
              console.error(error);
              toast.error(t("error"));
              setPendingImport(null);
              router.replace(pathname);
            } finally {
              setIsImporting(false);
            }
          }}
        >
          {isImporting ? t("importing") : t("import")}
        </Button>
      </div>
    </div>
  );
}

"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  detectBrowserDateFormat,
  detectBrowserTimezone,
  exportRawDatabaseBackup,
} from "@/lib/app-data-transfer";
import { USER_SETTINGS_ID } from "@/lib/rxdb-schema";
import { getDatabase, deleteDatabaseData, MyDatabase } from "./rxdb-database";

const DatabaseContext = createContext<MyDatabase | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<MyDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);
  const t = useTranslations("dbLoadError");

  const ensureDefaultSettings = async (db: MyDatabase) => {
    const existing = await db.settings.findOne(USER_SETTINGS_ID).exec();
    if (existing) {
      return;
    }

    await db.settings.upsert({
      id: USER_SETTINGS_ID,
      defaultCurrency: "USD",
      language: "en",
      timezone: detectBrowserTimezone(),
      dateFormat: detectBrowserDateFormat(),
      analyticsConsent: false,
      cookiesConsent: false,
    });
  };

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const db = await getDatabase();
        await ensureDefaultSettings(db);
        setDatabase(db);
        setIsReady(true);
        console.log("RxDB initialized and ready");
      } catch (error) {
        console.error("Database initialization error:", error);
        const err =
          error instanceof Error
            ? error
            : new Error(
                typeof error === "object"
                  ? JSON.stringify(error)
                  : String(error),
              );
        posthog.captureException(err);
        setLoadError(err);
        setIsReady(true);
      }
    };

    initDatabase();
  }, []);

  const handleExportBackup = async () => {
    try {
      setIsExportingBackup(true);
      await exportRawDatabaseBackup();
    } catch (error) {
      console.error("Backup export failed:", error);
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleClearDatabase = async () => {
    try {
      setIsClearingDatabase(true);
      await deleteDatabaseData();
      window.location.reload();
    } catch (error) {
      console.error("Database clear failed:", error);
      setIsClearingDatabase(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="bg-card border-border shadow-soft flex w-full max-w-xl flex-col gap-3 rounded-2xl border p-6">
          <div className="bg-muted h-8 w-1/3 animate-pulse rounded-lg" />
          <div className="bg-muted h-5 w-full animate-pulse rounded-lg" />
          <div className="bg-muted h-5 w-4/5 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-muted-foreground mb-1 text-xs">
              {t("errorLabel")}
            </p>
            <p className="break-all font-mono text-sm">{loadError.message}</p>
          </div>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={handleExportBackup}
              disabled={isExportingBackup || isClearingDatabase}
            >
              {isExportingBackup ? t("exporting") : t("exportButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearDatabase}
              disabled={isExportingBackup || isClearingDatabase}
            >
              {isClearingDatabase ? t("clearing") : t("clearButton")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (!database) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="bg-card border-border shadow-soft flex w-full max-w-xl flex-col gap-3 rounded-2xl border p-6">
          <div className="bg-muted h-8 w-1/3 animate-pulse rounded-lg" />
          <div className="bg-muted h-5 w-full animate-pulse rounded-lg" />
          <div className="bg-muted h-5 w-4/5 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return db;
}

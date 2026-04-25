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
import { getDatabase, DB_NAME, MyDatabase } from "./rxdb-database";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const DatabaseContext = createContext<MyDatabase | null>(null);

async function exportRawDatabaseBackup(): Promise<void> {
  return new Promise((resolve, reject) => {
    const openReq = indexedDB.open(DB_NAME);

    openReq.onerror = () =>
      reject(new Error("Could not open database for export"));

    openReq.onsuccess = () => {
      const db = openReq.result;
      const storeNames = Array.from(db.objectStoreNames);
      const allData: Record<string, unknown[]> = {};

      const finalize = () => {
        db.close();
        const blob = new Blob(
          [
            JSON.stringify(
              {
                dbName: DB_NAME,
                exportedAt: new Date().toISOString(),
                data: allData,
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `friend-zone-raw-backup-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      };

      if (storeNames.length === 0) {
        finalize();
        return;
      }

      let remaining = storeNames.length;
      const tx = db.transaction(storeNames, "readonly");

      for (const storeName of storeNames) {
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        const finish = (items: unknown[]) => {
          allData[storeName] = items;
          remaining--;
          if (remaining === 0) finalize();
        };

        req.onsuccess = () => finish(req.result as unknown[]);
        req.onerror = () => finish([]);
      }
    };
  });
}

async function deleteRawDatabase(): Promise<void> {
  return new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<MyDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);
  const t = useTranslations("dbLoadError");

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const db = await getDatabase();
        setDatabase(db);
        setIsReady(true);
        console.log("RxDB initialized and ready");
      } catch (error) {
        console.error("Database initialization error:", error);
        const err = error instanceof Error ? error : new Error(String(error));
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
      console.error("Raw backup export failed:", error);
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleClearDatabase = async () => {
    try {
      setIsClearingDatabase(true);
      await deleteRawDatabase();
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

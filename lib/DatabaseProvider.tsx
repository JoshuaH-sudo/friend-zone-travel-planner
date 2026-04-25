"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { getDatabase, MyDatabase } from "./rxdb-database";

export const DatabaseContext = createContext<MyDatabase | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<MyDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const db = await getDatabase();
        setDatabase(db);
        setIsReady(true);
        console.log("RxDB initialized and ready");
      } catch (error) {
        console.error("Database initialization error:", error);
        setIsReady(true);
      }
    };

    initDatabase();
  }, []);

  if (!isReady || !database) {
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

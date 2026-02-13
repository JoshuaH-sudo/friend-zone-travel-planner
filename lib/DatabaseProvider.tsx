"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { getDatabase, MyDatabase } from "./rxdb-database";

const DatabaseContext = createContext<MyDatabase | null>(null);

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
      <div className="flex min-h-screen items-center justify-center">
        Loading database...
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

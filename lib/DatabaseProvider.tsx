"use client";

import { createContext, useContext, ReactNode } from "react";
import { Database } from "@nozbe/watermelondb";
import { database } from "./database";

const DatabaseContext = createContext<Database | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
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

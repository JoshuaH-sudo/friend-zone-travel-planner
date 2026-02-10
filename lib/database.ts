import { Database } from "@nozbe/watermelondb";
import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";

import schema from "@/model/schema";
import migrations from "@/model/migrations";
import Trip from "@/model/Trip";
import Stop from "@/model/Stop";
import Accommodation from "@/model/Accommodation";
import Transport from "@/model/Transport";

const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  dbName: "fzt-db",
  onQuotaExceededError: (error) => {
    console.error("Database quota exceeded:", error);
  },
  onSetUpError: (error) => {
    console.error("Database setup error:", error);
  },
  extraIncrementalIDBOptions: {
    onDidOverwrite: () => {
      console.warn("Database was overwritten by another tab");
    },
    onversionchange: () => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    },
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Trip, Stop, Accommodation, Transport],
});

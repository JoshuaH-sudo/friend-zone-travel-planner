"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useDatabase } from "@/lib/DatabaseProvider";
import { USER_SETTINGS_ID } from "@/lib/rxdb-schema";

interface Settings {
  defaultCurrency: string;
  language: string;
  timezone: string;
}

interface SettingsContextValue extends Settings {
  setDefaultCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
}

const defaultSettings: Settings = {
  defaultCurrency: "USD",
  language: "en",
  timezone: "UTC",
};

const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  setDefaultCurrency: () => {},
  setLanguage: () => {},
  setTimezone: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const db = useDatabase();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Subscribe to settings document in RxDB
  useEffect(() => {
    const subscription = db.settings
      .findOne(USER_SETTINGS_ID)
      .$.subscribe((doc) => {
        if (doc) {
          setSettings({
            defaultCurrency: doc.defaultCurrency,
            language: doc.language,
            timezone: doc.timezone,
          });
        }
      });

    return () => subscription.unsubscribe();
  }, [db]);

  const updateSettings = async (partial: Partial<Settings>) => {
    const currentDoc = await db.settings.findOne(USER_SETTINGS_ID).exec();
    const current: Settings = currentDoc
      ? {
          defaultCurrency: currentDoc.defaultCurrency,
          language: currentDoc.language,
          timezone: currentDoc.timezone,
        }
      : defaultSettings;
    await db.settings.upsert({
      id: USER_SETTINGS_ID,
      ...current,
      ...partial,
    });
  };

  const value: SettingsContextValue = {
    ...settings,
    setDefaultCurrency: (currency) => updateSettings({ defaultCurrency: currency }),
    setLanguage: (language) => updateSettings({ language }),
    setTimezone: (timezone) => updateSettings({ timezone }),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

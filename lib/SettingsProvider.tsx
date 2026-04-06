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
}

interface SettingsContextValue extends Settings {
  setDefaultCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
}

const defaultSettings: Settings = {
  defaultCurrency: "USD",
  language: "en",
};

const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  setDefaultCurrency: () => {},
  setLanguage: () => {},
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
          });
        }
      });

    return () => subscription.unsubscribe();
  }, [db]);

  const updateSettings = async (partial: Partial<Settings>) => {
    const next = { ...settings, ...partial };
    await db.settings.upsert({
      id: USER_SETTINGS_ID,
      ...next,
    });
  };

  const value: SettingsContextValue = {
    ...settings,
    setDefaultCurrency: (currency) => updateSettings({ defaultCurrency: currency }),
    setLanguage: (language) => updateSettings({ language }),
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

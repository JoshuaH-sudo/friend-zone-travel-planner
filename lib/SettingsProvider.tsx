"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

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

const STORAGE_KEY = "fzt-settings";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      // ignore parse errors
    }
    setMounted(true);
  }, []);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const value: SettingsContextValue = {
    ...settings,
    setDefaultCurrency: (currency) => updateSettings({ defaultCurrency: currency }),
    setLanguage: (language) => updateSettings({ language }),
  };

  if (!mounted) return null;

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import posthog from "posthog-js";
import { useDatabase } from "@/lib/DatabaseProvider";
import { USER_SETTINGS_ID, DateFormat } from "@/lib/rxdb-schema";
import {
  detectBrowserTimezone,
  detectBrowserDateFormat,
} from "@/lib/app-data-transfer";

interface Settings {
  defaultCurrency: string;
  language: string;
  timezone: string;
  dateFormat: DateFormat;
  analyticsConsent: boolean;
  cookiesConsent: boolean;
}

interface SettingsContextValue extends Settings {
  setDefaultCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setDateFormat: (dateFormat: DateFormat) => void;
  setAnalyticsConsent: (value: boolean) => void;
  setCookiesConsent: (value: boolean) => void;
}

function getDefaultSettings(): Settings {
  return {
    defaultCurrency: "USD",
    language: "en",
    timezone: typeof window !== "undefined" ? detectBrowserTimezone() : "UTC",
    dateFormat:
      typeof window !== "undefined" ? detectBrowserDateFormat() : "MM/dd/yyyy",
    analyticsConsent: false,
    cookiesConsent: false,
  };
}

const supportedLanguages = new Set(["en", "de"]);

// Static fallback for SSR context (actual values detected client-side)
const ssrFallbackSettings: Settings = {
  defaultCurrency: "USD",
  language: "en",
  timezone: "UTC",
  dateFormat: "MM/dd/yyyy",
  analyticsConsent: false,
  cookiesConsent: false,
};

const SettingsContext = createContext<SettingsContextValue>({
  ...ssrFallbackSettings,
  setDefaultCurrency: () => {},
  setLanguage: () => {},
  setTimezone: () => {},
  setDateFormat: () => {},
  setAnalyticsConsent: () => {},
  setCookiesConsent: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const db = useDatabase();
  const [settings, setSettings] = useState<Settings>(getDefaultSettings);

  // Subscribe to settings document in RxDB
  useEffect(() => {
    const defaults = getDefaultSettings();
    const subscription = db.settings
      .findOne(USER_SETTINGS_ID)
      .$.subscribe((doc) => {
        if (doc) {
          setSettings({
            defaultCurrency: doc.defaultCurrency,
            language: doc.language,
            timezone: doc.timezone,
            dateFormat: doc.dateFormat ?? defaults.dateFormat,
            analyticsConsent: doc.analyticsConsent ?? false,
            cookiesConsent: doc.cookiesConsent ?? false,
          });
        }
      });

    return () => subscription.unsubscribe();
  }, [db]);

  // Sync PostHog opt-in/opt-out with the analyticsConsent setting
  useEffect(() => {
    if (settings.analyticsConsent) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  }, [settings.analyticsConsent]);

  const updateSettings = async (partial: Partial<Settings>) => {
    const currentDoc = await db.settings.findOne(USER_SETTINGS_ID).exec();
    const defaults = getDefaultSettings();
    const current: Settings = currentDoc
      ? {
          defaultCurrency: currentDoc.defaultCurrency,
          language: currentDoc.language,
          timezone: currentDoc.timezone,
          dateFormat: currentDoc.dateFormat ?? defaults.dateFormat,
          analyticsConsent: currentDoc.analyticsConsent ?? false,
          cookiesConsent: currentDoc.cookiesConsent ?? false,
        }
      : defaults;
    await db.settings.upsert({
      id: USER_SETTINGS_ID,
      ...current,
      ...partial,
    });
  };

  const value: SettingsContextValue = {
    ...settings,
    setDefaultCurrency: (currency) =>
      updateSettings({ defaultCurrency: currency }),
    setLanguage: (language) => {
      if (typeof document !== "undefined" && supportedLanguages.has(language)) {
        const secureCookieAttribute =
          process.env.NODE_ENV === "production" ? ";secure" : "";
        document.cookie = `NEXT_LOCALE=${language};path=/;max-age=31536000;samesite=lax${secureCookieAttribute}`;
      }
      updateSettings({ language });
    },
    setTimezone: (timezone) => updateSettings({ timezone }),
    setDateFormat: (dateFormat) => updateSettings({ dateFormat }),
    setAnalyticsConsent: (value) => updateSettings({ analyticsConsent: value }),
    setCookiesConsent: (value) => updateSettings({ cookiesConsent: value }),
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

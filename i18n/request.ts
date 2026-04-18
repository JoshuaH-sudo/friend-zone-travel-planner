import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const locales = ["en", "de"] as const;
const defaultLocale = "en";

const resolveLocaleFromAcceptLanguage = (header: string | null) => {
  if (!header) return defaultLocale;

  const requestedLocales = header
    .split(",")
    .map((entry) => entry.trim())
    .map((entry) => entry.split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const locale of requestedLocales) {
    if (locale === "de" || locale.startsWith("de-")) {
      return "de";
    }
    if (locale === "en" || locale.startsWith("en-")) {
      return "en";
    }
  }

  return defaultLocale;
};

export default getRequestConfig(async () => {
  const localeCookie = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = locales.includes(localeCookie as (typeof locales)[number])
    ? localeCookie
    : resolveLocaleFromAcceptLanguage((await headers()).get("accept-language"));

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

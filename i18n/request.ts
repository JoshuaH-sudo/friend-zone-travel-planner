import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const locales = ["en", "de"] as const;
const defaultLocale = "en";

const resolveLocaleFromAcceptLanguage = (header: string | null) => {
  if (!header) return defaultLocale;
  const normalized = header.toLowerCase();

  if (normalized.includes("de")) {
    return "de";
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

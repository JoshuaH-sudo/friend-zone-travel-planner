import { de, enUS, Locale } from "date-fns/locale";

export enum SupportedLocales {
  EN = 'en',
  DE = 'de',
}

export type AvailableLocals = keyof typeof SupportedLocales

type DateLocaleMap = {
  [key in SupportedLocales]: Locale;
};

export const dateLocaleMaps: DateLocaleMap = {
  'en': enUS,
  'de': de,
}
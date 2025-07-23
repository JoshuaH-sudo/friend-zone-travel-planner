import { useTranslation } from 'react-i18next';
import { de, enUS, Locale } from 'date-fns/locale';
import { SupportedLocales } from '../i18n';

type DateLocaleMap = {
  [key in SupportedLocales]: Locale;
};

export const dateLocaleMaps: DateLocaleMap = {
  en: enUS,
  de: de,
};

function useGetDateLocale() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const dateLocale = dateLocaleMaps[locale as SupportedLocales];

  return dateLocale;
}

export default useGetDateLocale;

import { dateLocaleMaps, SupportedLocales } from "@/i18n/utils";
import { useTranslation } from "react-i18next";

function useGetDateLocale() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const dateLocale = dateLocaleMaps[locale as SupportedLocales]

  return dateLocale;
}

export default useGetDateLocale;

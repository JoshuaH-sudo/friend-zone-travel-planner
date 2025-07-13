import { dateLocaleMaps, SupportedLocales } from "@/i18n/utils";
import { useLocale } from "next-intl";

function useGetDateLocale() {
  const locale = useLocale();
  const dateLocale = dateLocaleMaps[locale as SupportedLocales]

  return dateLocale;
}

export default useGetDateLocale;
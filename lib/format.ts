export const STATIC_RATES: Record<string, number> = {
  // Static fallback FX table (updated: 2026-04-19, base USD=1).
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.37,
  AUD: 1.53,
  NZD: 1.67,
  SEK: 10.52,
  NOK: 10.87,
  DKK: 6.87,
};

export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> = STATIC_RATES,
) {
  if (!Number.isFinite(amount)) return 0;
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  return (amount / fromRate) * toRate;
}

export function formatMoney(amount: number, currency: string, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return "No dates";
  if (start && !end) return start;
  if (!start && end) return end;
  if (start === end) return start ?? "";
  return `${start} → ${end}`;
}

export function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  const startAt = new Date(start).getTime();
  const endAt = new Date(end).getTime();
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt < startAt) {
    return 0;
  }
  return Math.max(1, Math.ceil((endAt - startAt) / 86_400_000));
}

export const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const formatDateShort = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

type DateFormatOption = "MM/dd/yyyy" | "dd/MM/yyyy" | "yyyy-MM-dd";

/**
 * Format a date string using the user's preferred date format.
 * For short display (no year), we just use month/day in the appropriate order.
 */
export const formatDateShortWithFormat = (
  iso: string,
  dateFormat: DateFormatOption,
) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");

  switch (dateFormat) {
    case "dd/MM/yyyy":
      return `${day}/${month}`;
    case "yyyy-MM-dd":
      return `${month}-${day}`;
    case "MM/dd/yyyy":
    default:
      return `${month}/${day}`;
  }
};

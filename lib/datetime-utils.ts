import { format } from "date-fns";

/**
 * Regex that accepts both:
 * - legacy date-only strings:  "YYYY-MM-DD"
 * - new combined datetime strings: "YYYY-MM-DDTHH:MM"
 */
export const DATE_OR_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;

/** Required combined datetime string: "YYYY-MM-DDTHH:MM" */
export const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Parse stored date/datetime values in local time. */
export function parseStoredDateTime(value: string): Date | undefined {
  if (DATETIME_REGEX.test(value)) {
    const [datePart, timePart] = value.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, min] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, h, min, 0, 0);
  }

  if (DATE_ONLY_REGEX.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }

  return undefined;
}

/**
 * Convert stored date/datetime to timestamp.
 * For date-only values, you can choose day start/end boundary.
 */
export function getStoredDateTimeTimestamp(
  value: string,
  options?: { dateOnlyBoundary?: "start" | "end" },
): number {
  if (DATE_ONLY_REGEX.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    const isEnd = options?.dateOnlyBoundary === "end";
    return new Date(
      y,
      m - 1,
      d,
      isEnd ? 23 : 0,
      isEnd ? 59 : 0,
      isEnd ? 59 : 0,
      isEnd ? 999 : 0,
    ).getTime();
  }

  const parsed = parseStoredDateTime(value);
  return parsed ? parsed.getTime() : new Date(value).getTime();
}

/**
 * Format a stored ISO date ("YYYY-MM-DD") or datetime ("YYYY-MM-DDTHH:MM") string
 * for human-readable display (e.g. "01/18/2026 02:30 PM").
 * Falls back to the raw string on any parse error.
 */
export function formatStoredDateTime(dt: string): string {
  try {
    const parsed = parseStoredDateTime(dt);
    if (parsed) {
      return format(parsed, "MM/dd/yyyy hh:mm aa");
    }

    return dt;
  } catch {
    return dt;
  }
}

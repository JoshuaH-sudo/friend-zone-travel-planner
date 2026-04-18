import { format } from "date-fns";

/**
 * Regex that accepts both:
 * - legacy date-only strings:  "YYYY-MM-DD"
 * - new combined datetime strings: "YYYY-MM-DDTHH:MM"
 */
export const DATE_OR_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;

/** Required combined datetime string: "YYYY-MM-DDTHH:MM" */
export const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/**
 * Format a stored ISO date ("YYYY-MM-DD") or datetime ("YYYY-MM-DDTHH:MM") string
 * for human-readable display (e.g. "01/18/2026 02:30 PM").
 * Falls back to the raw string on any parse error.
 */
export function formatStoredDateTime(dt: string): string {
  try {
    const [datePart, timePart] = dt.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, min] = (timePart ?? "12:00").split(":").map(Number);
    return format(new Date(y, m - 1, d, h, min), "MM/dd/yyyy hh:mm aa");
  } catch {
    return dt;
  }
}

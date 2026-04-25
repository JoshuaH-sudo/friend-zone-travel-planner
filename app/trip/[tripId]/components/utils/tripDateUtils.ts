import { addDays, format as formatDateFns } from "date-fns";

/**
 * Shifts a stored "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM" string by `deltaDays`.
 * Returns the original value unchanged if the format is not recognised.
 */
export function shiftDateTimeByDays(value: string, deltaDays: number): string {
  const [datePart, timePart] = value.split("T");
  if (!datePart || !/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return value;
  }
  const [y, m, d] = datePart.split("-").map(Number);
  const shifted = addDays(new Date(y, m - 1, d), deltaDays);
  const newDate = formatDateFns(shifted, "yyyy-MM-dd");
  return timePart ? `${newDate}T${timePart}` : newDate;
}

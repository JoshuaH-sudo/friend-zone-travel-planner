"use client";
import { DateRange, DayPicker } from "react-day-picker";
import { addDays } from "date-fns";

type DateRangeModifier = {
  range_start: Date[];
  range_middle: { after: Date; before: Date }[];
  range_end: Date[];
};
/**
 * Generates date range modifiers from an array of date ranges.
 *
 * @param {DateRange[]} ranges - An array of date ranges.
 * @returns {DateRangeModifier} An object containing arrays of start dates, end dates, and middle date ranges.
 *
 * The returned object has the following structure:
 * - `range_start`: An array of start dates from the provided date ranges.
 * - `range_end`: An array of end dates from the provided date ranges.
 * - `range_middle`: An array of objects representing the middle date ranges, each containing an `after` and `before` date.
 */
export function dateRangeModifiers(ranges: DateRange[]) {
  return ranges.reduce<DateRangeModifier>(
    (prev, curr) => ({
      // Add the 'from' date to range_start if it exists
      range_start: curr.from
        ? [...prev.range_start, curr.from]
        : prev.range_start,
      // Add the 'to' date to range_end if it exists
      range_end: curr.to ? [...prev.range_end, curr.to] : prev.range_end,
      // Add an object with 'after' and 'before' properties to range_middle if both 'from' and 'to' dates exist
      range_middle:
        curr.from && curr.to
          ? [...prev.range_middle, { after: curr.from, before: curr.to }]
          : prev.range_middle,
    }),
    {
      range_start: [],
      range_middle: [],
      range_end: [],
    },
  );
}

const Calender = () => {
  const dateRang1: DateRange = { from: new Date(), to: addDays(new Date(), 3)};
  const dateRang2: DateRange = {
    from: addDays(new Date(), 9),
    to: addDays(new Date(), 14),
  };
  const ranges = [dateRang1, dateRang2];
  return (
    <DayPicker
      mode="range"
      modifiers={dateRangeModifiers(ranges)}
      //@ts-expect-error multiple date ranges are unsupported in the react-day-picker library
      selected={ranges}
    />
  );
};

export default Calender;
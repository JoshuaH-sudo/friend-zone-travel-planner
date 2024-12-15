"use client";
import { DateRange, DayPicker } from "react-day-picker";
import { addDays } from "date-fns";

type DateRangeModifier = {
  range_start: Date[];
  range_middle: { after: Date; before: Date }[];
  range_end: Date[];
};
export function dateRangeModifiers(ranges: DateRange[]) {
  return ranges.reduce<DateRangeModifier>(
    (prev, curr) => ({
      range_start: curr.from
        ? [...prev.range_start, curr.from]
        : prev.range_start,
      range_end: curr.to ? [...prev.range_end, curr.to] : prev.range_end,
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
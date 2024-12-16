"use client";
import { DateRange, DayPicker } from "react-day-picker";
import { FC } from "react";

type DateRangeModifier = {
  range_start: Date[];
  range_middle: { after: Date; before: Date }[];
  range_end: Date[];
};

interface ResultsCalenderProps {
  ranges: DateRange[];
}
const ResultsCalender: FC<ResultsCalenderProps> = ({ ranges }) => {
  function dateRangeModifiers(ranges: DateRange[]) {
    const range_modifiers = ranges.reduce<DateRangeModifier>(
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
    return {
      ...range_modifiers,
    };
  }

  return (
    <DayPicker
      modifiers={dateRangeModifiers(ranges)}
      classNames={{
        selected: "bg-green-500",
        range_start: "bg-green-900",
        range_middle: "bg-green-500",
        range_end: "bg-green-900",
      }}
      //@ts-expect-error multiple date ranges are unsupported in the react-day-picker library
      selected={ranges}
    />
  );
};

export default ResultsCalender;

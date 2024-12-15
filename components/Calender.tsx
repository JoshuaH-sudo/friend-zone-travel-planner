"use client";
import { DateRange, DayPicker, DayPickerProps } from "react-day-picker";
import { useEffect, useState } from "react";
import { DateRangeNullable } from "./types";
import service from "./services";
import { addDayToRange, isDayInRange } from "./DateUtils";

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


const dateRangeNullableDefault: DateRangeNullable = {
  from: null,
  to: null,
};

const Calender = () => {
  const [tempRange, setTempRange] = useState<DateRangeNullable>({
    from: null,
    to: null,
  });
  const [ranges, setRanges] = useState<DateRange[]>([]);
  const [lastDayMouseEnter, setLastDayMouseEnter] = useState<
    DateRange["to"] | null
  >(null);

  const tempRangeToMouse: DateRange = {
    from: tempRange.from!,
    to: lastDayMouseEnter!,
  }
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
      tempRange_start: tempRange.from ? [tempRange.from] : [],
      tempRange_middle: tempRange.from && lastDayMouseEnter ? [{ after: tempRange.from, before: lastDayMouseEnter }] : [],
      tempRange_end: lastDayMouseEnter ? [lastDayMouseEnter] : [],
    };
  }
  useEffect(() => {
    if (!!tempRange.from && !!tempRange.to) {
      const { shouldIncrease, increasedRanges } = service.increaseSmallerRanges(
        tempRange,
        ranges,
      );
      setRanges(
        shouldIncrease ? increasedRanges : [...ranges, tempRange as DateRange],
      );
    }
  }, [tempRange]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTempRange(dateRangeNullableDefault);
    setLastDayMouseEnter(null);
  }, [ranges]);

  const handleDayClick: DayPickerProps["onDayClick"] = (day, modifiers) => {
    const { selected } = modifiers;
    const isDayInHoverRange = isDayInRange(day, {
      from: tempRange.from,
      to: lastDayMouseEnter,
    });

    // Clicking logic:
    // 1. startDate    -> selected: undefined, isDayInHoverRange: null
    // 2. endDate      -> selected: true,      isDayInHoverRange: true
    // 3. remove range -> selected: true,      isDayInHoverRange: null
    if (!selected || isDayInHoverRange) {
      setTempRange(addDayToRange(day, tempRange as DateRange));
    } else {
      const filteredRanges = ranges.filter(
        (r: DateRange) => !isDayInRange(day, r),
      );
      setRanges(filteredRanges);
    }
  };

  const handleDayMouseEnter: DayPickerProps["onDayMouseEnter"] = (day) => {
    const { from, to } = tempRange;
    if (!service.isSelectingFirstDay(from, to, day)) {
      setLastDayMouseEnter(day);
    }
  };

  return (
    <DayPicker
      onDayMouseEnter={handleDayMouseEnter}
      onDayClick={handleDayClick}
      modifiers={dateRangeModifiers(ranges)}
      // We add a class name to match with a modifier that we defined.
      modifiersClassNames={{ tempRange_start: "temp-range_start", tempRange_middle: "temp-range_middle", tempRange_end: "temp-range_end" }}
      //@ts-expect-error multiple date ranges are unsupported in the react-day-picker library
      selected={[tempRangeToMouse, ...ranges]}
    />
  );
};

export default Calender;

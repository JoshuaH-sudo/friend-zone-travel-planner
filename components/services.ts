import { DateRange } from 'react-day-picker'
import { DateRangeNullable } from './types'
import { isDayBefore, isDayInRange } from './DateUtils'

export default class DatePickerRangeService {
  // Determines if the user is selecting the first day of the range
  static isSelectingFirstDay = (
    from: Date | null,
    to: Date | null,
    day: Date
  ): boolean | Date | null => {
    // Check if the selected day is before the first day
    const isBeforeFirstDay = from && isDayBefore(day, from)
    // Check if the range is already selected
    const isRangeSelected = from && to
    // Return true if no start date, or if the selected day is before the start date, or if the range is already selected
    return !from || isBeforeFirstDay || isRangeSelected
  }

  // Increases the ranges that are smaller than the temporary range
  static increaseSmallerRanges = (
    tempRangeNullable: DateRangeNullable,
    ranges: DateRange[]
  ): { shouldIncrease: boolean; increasedRanges: DateRange[] } => {
    let shouldIncrease = false
    const tempRange = tempRangeNullable as DateRange

    const increasedRanges = ranges.map((r: DateRange) => {
      const { from, to } = r
      // Check if the start date of the range is within the temporary range
      const isFromInTempRange = isDayInRange(from, tempRange)
      // Check if the end date of the range is within the temporary range
      const isToInTempRange = isDayInRange(to, tempRange)

      if (isFromInTempRange && isToInTempRange) {
        // If both start and end dates are within the temporary range, increase the range
        shouldIncrease = true
        return tempRange as DateRange
      } else if (isFromInTempRange && !isToInTempRange) {
        // If only the start date is within the temporary range, adjust the range
        shouldIncrease = true
        return { from: tempRange.from, to }
      } else {
        // Otherwise, return the original range
        return r
      }
    })

    return {
      shouldIncrease,
      // Remove duplicate ranges
      increasedRanges: [...new Set(increasedRanges)]
    }
  }
}
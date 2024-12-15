import { DateRange } from 'react-day-picker'
import { DateRangeNullable } from './types'
import { isDayBefore, isDayInRange } from './DateUtils'

export default class DatePickerRangeService {
  static isSelectingFirstDay = (
    from: Date | null,
    to: Date | null,
    day: Date
  ): boolean | Date | null => {
    const isBeforeFirstDay = from && isDayBefore(day, from)
    const isRangeSelected = from && to
    return !from || isBeforeFirstDay || isRangeSelected
  }

  static increaseSmallerRanges = (
    tempRangeNullable: DateRangeNullable,
    ranges: DateRange[]
  ): { shouldIncrease: boolean; increasedRanges: DateRange[] } => {
    let shouldIncrease = false
    const tempRange = tempRangeNullable as DateRange

    const increasedRanges = ranges.map((r: DateRange) => {
      const { from, to } = r
      const isFromInTempRange = isDayInRange(from, tempRange)
      const isToInTempRange = isDayInRange(to, tempRange)

      if (isFromInTempRange && isToInTempRange) {
        shouldIncrease = true
        return tempRange as DateRange
      } else if (isFromInTempRange && !isToInTempRange) {
        shouldIncrease = true
        return { from: tempRange.from, to }
      } else {
        return r
      }
    })

    return {
      shouldIncrease,
      increasedRanges: [...new Set(increasedRanges)]
    }
  }
}
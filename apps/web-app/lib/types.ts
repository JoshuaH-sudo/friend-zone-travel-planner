export type DayRange = number[];
export type AvailableHours = {
  weekdays: DayRange;
  weekends: DayRange;
  dates: {
    [utcDate: string]: DayRange;
  };
};

export interface Friend {
  id: string;
  name: string;
  color: string;
  address: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
  timeZoneId: string;
  timezoneOffset: number;
  availableDates: Date[];
  availableHours: AvailableHours;
}

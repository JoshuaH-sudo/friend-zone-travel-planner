export interface Friend {
  id: string;
  name: string;
  color: string;
  address: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
  timezoneOffset: number;
  availableDates: Date[];
}

export interface Friend {
  id: string;
  name: string;
  color: string;
  address: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
  availableDates: Date[];
}

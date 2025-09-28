export interface CreateAccommodationData {
  destinationId: string;
  name: string;
  address: string;
  cost: number;
  currency: string;
  href: string | null;
  type: AccommodationType;
  friendId: string | null;
  checkIn: Date | null;
  checkOut: Date | null;
}

export interface AccommodationData {
  id: string;
  destinationId: string;
  name: string;
  address: string;
  cost: number;
  currency: string;
  href: string | null;
  type: AccommodationType;
  friendId: string | null;
  checkIn: Date | null;
  checkOut: Date | null;
}

export enum AccommodationType {
  Hotel = 'hotel',
  Motel = 'motel',
  Hostel = 'hostel',
  Friend = 'friend',
  Airbnb = 'airbnb',
  Other = 'other',
}

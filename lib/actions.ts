'use server';

import { googleMapsClient } from './google-maps';

export const getAddressCoordinates = async (address: string) => {
  const result = await googleMapsClient.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY!,
    },
  });

  return result.data.results[0];
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export const getTimezoneInformation = async (coordinates: Coordinates) => {
  const { lat, lng } = coordinates;

  const result = await googleMapsClient.timezone({
    params: {
      location: `${lat},${lng}`,
      key: process.env.GOOGLE_MAPS_API_KEY!,
      timestamp: Math.floor(Date.now() / 1000),
    },
  });

  return result.data;
};

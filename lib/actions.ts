"use server";

import { googleMapsClient } from "./google-maps";

export const getAddressCoordinates = async (address: string) => {
  const result = await googleMapsClient.geocode(
    {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    }
  );

  console.log("result", result.data);
  return result.data.results[0];
}
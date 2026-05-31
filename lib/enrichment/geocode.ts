export type GeocodeResult = {
  latitude: number;
  longitude: number;
  countryCode?: string;
};

export async function geocodeLocation(
  query: string,
): Promise<GeocodeResult | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
    {
      headers: {
        "Accept-Language": "en",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed for "${query}": ${response.status}`);
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    address?: { country_code?: string };
  }>;

  const first = results[0];
  if (!first) {
    return null;
  }

  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    countryCode: first.address?.country_code?.toUpperCase(),
  };
}

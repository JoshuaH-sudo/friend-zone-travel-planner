export type NagerHoliday = {
  date: string;
  localName: string;
  name: string;
};

export async function fetchCountryHolidays(
  countryCode: string,
  year: number,
): Promise<NagerHoliday[]> {
  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Holiday lookup failed for ${countryCode}/${year}: ${response.status}`,
    );
  }

  const data = (await response.json()) as NagerHoliday[];
  return Array.isArray(data) ? data : [];
}

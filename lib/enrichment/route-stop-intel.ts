import { RouteStopDocumentType } from "@/lib/rxdb-schema";
import { fetchCountryHolidays } from "@/lib/enrichment/nager";
import { ROUTE_STOP_INTEL_TTL_MS } from "@/lib/routes/constants";

const MAX_INTEL_ITEMS = 8;

export async function getRouteStopIntel(
  routeStop: RouteStopDocumentType,
): Promise<{ name: string; date: string }[]> {
  const cached = routeStop.intel;
  if (cached && Date.now() - cached.fetchedAt <= ROUTE_STOP_INTEL_TTL_MS) {
    return cached.items;
  }

  if (!routeStop.countryCode) {
    return cached?.items ?? [];
  }

  const year = Number(
    (routeStop.startDate ?? new Date().toISOString().slice(0, 10)).slice(0, 4),
  );
  try {
    const holidays = await fetchCountryHolidays(
      routeStop.countryCode.toUpperCase(),
      year,
    );

    const items = holidays.slice(0, MAX_INTEL_ITEMS).map((holiday) => ({
      name: holiday.localName || holiday.name,
      date: holiday.date,
    }));

    await routeStop.patch({
      intel: {
        fetchedAt: Date.now(),
        items,
      },
      updatedAt: Date.now(),
    });

    return items;
  } catch {
    return cached?.items ?? [];
  }
}

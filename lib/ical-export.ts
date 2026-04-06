import { MyDatabase } from "./rxdb-database";

function formatIcalDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

function addOneDay(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0].replace(/-/g, "");
}

function sanitizeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export async function exportTripToIcal(
  database: MyDatabase,
  tripId: string,
): Promise<void> {
  const trip = await database.trips.findOne(tripId).exec();
  if (!trip) return;

  const stops = await database.stops
    .find({ selector: { tripId } })
    .sort({ date: "asc" })
    .exec();

  const stopIds = stops.map((s) => s.id);

  const accommodations =
    stopIds.length > 0
      ? await database.accommodations
          .find({ selector: { stopId: { $in: stopIds } } })
          .exec()
      : [];

  const transports =
    stopIds.length > 0
      ? await database.transports
          .find({ selector: { stopId: { $in: stopIds } } })
          .exec()
      : [];

  const allDates: string[] = [
    ...stops.map((s) => s.date),
    ...accommodations.flatMap((a) => [a.checkIn, a.checkOut]),
    ...transports.map((t) => t.date),
  ].filter(Boolean);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Friend Zone Travel Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  if (allDates.length > 0) {
    const minDate = allDates.reduce((min, d) => (d < min ? d : min));
    const maxDate = allDates.reduce((max, d) => (d > max ? d : max));

    lines.push(
      "BEGIN:VEVENT",
      `UID:trip-${tripId}@friend-zone-travel-planner`,
      `DTSTART;VALUE=DATE:${formatIcalDate(minDate)}`,
      `DTEND;VALUE=DATE:${addOneDay(maxDate)}`,
      `SUMMARY:Trip: ${sanitizeText(trip.name)}`,
      "END:VEVENT",
    );
  }

  for (const transport of transports) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:transport-${transport.id}@friend-zone-travel-planner`,
      `DTSTART;VALUE=DATE:${formatIcalDate(transport.date)}`,
      `DTEND;VALUE=DATE:${addOneDay(transport.date)}`,
      `SUMMARY:${sanitizeText(transport.name)} (${transport.type})`,
      "END:VEVENT",
    );
  }

  for (const accommodation of accommodations) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:accommodation-${accommodation.id}@friend-zone-travel-planner`,
      `DTSTART;VALUE=DATE:${formatIcalDate(accommodation.checkIn)}`,
      `DTEND;VALUE=DATE:${addOneDay(accommodation.checkOut)}`,
      `SUMMARY:${sanitizeText(accommodation.name)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  const icalContent = lines.join("\r\n");

  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    trip.name
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim() || "trip";
  link.download += ".ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

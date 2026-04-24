import { MyDatabase } from "./rxdb-database";

/** Format a YYYY-MM-DD string as an iCal DATE value (YYYYMMDD). */
function formatIcalDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/**
 * Return the date string for the day after `dateStr` (YYYY-MM-DD).
 * Uses UTC-only arithmetic to avoid any local-timezone shift.
 */
function addOneDay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const y = next.getUTCFullYear().toString().padStart(4, "0");
  const m = (next.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = next.getUTCDate().toString().padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Format a Date as a UTC DTSTAMP value (YYYYMMDDTHHmmssZ). */
function formatDtStamp(now: Date): string {
  const y = now.getUTCFullYear().toString().padStart(4, "0");
  const mo = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = now.getUTCDate().toString().padStart(2, "0");
  const h = now.getUTCHours().toString().padStart(2, "0");
  const mi = now.getUTCMinutes().toString().padStart(2, "0");
  const s = now.getUTCSeconds().toString().padStart(2, "0");
  return `${y}${mo}${d}T${h}${mi}${s}Z`;
}

/**
 * Build a DTSTART or DTEND property string.
 *
 * When a time (HH:MM) is supplied, the date+time represent a local moment in
 * the named timezone (the user entered both values in that tz), so we emit a
 * TZID-scoped datetime without any UTC conversion. When no time is given, we
 * emit a floating all-day DATE value.
 */
function dtProp(
  propName: "DTSTART" | "DTEND",
  dateStr: string,
  timeStr: string | undefined,
  tz: string | undefined,
): string {
  if (timeStr) {
    const icalTime = `${formatIcalDate(dateStr)}T${timeStr.replace(":", "")}00`;
    if (tz) {
      return `${propName};TZID=${tz}:${icalTime}`;
    }
    return `${propName}:${icalTime}`;
  }
  return `${propName};VALUE=DATE:${formatIcalDate(dateStr)}`;
}

/** Extract just the date portion (YYYY-MM-DD) from an ISO date or datetime string. */
function getDatePart(isoStr: string): string {
  return isoStr.split("T")[0];
}

/** Extract the time portion (HH:MM) from an ISO datetime string, or undefined for date-only. */
function getTimePart(isoStr: string): string | undefined {
  const parts = isoStr.split("T");
  return parts.length > 1 ? parts[1].substring(0, 5) : undefined;
}
function sanitizeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/**
 * Fold a single iCal content line to at most 75 octets per physical line,
 * as required by RFC 5545 §3.1. Continuation lines are prefixed with a space.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const segments: string[] = [];
  const chars = [...line]; // correctly iterate unicode code points
  let current = "";
  let currentBytes = 0;
  let maxBytes = 75; // first physical line: 75 octets

  for (const char of chars) {
    const charBytes = encoder.encode(char).length;
    if (currentBytes + charBytes > maxBytes) {
      segments.push(current);
      current = char;
      currentBytes = charBytes;
      maxBytes = 74; // physical line = 1-byte space prefix (added by join) + ≤74 content bytes = ≤75 octets total
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }

  if (current) segments.push(current);

  // Join with CRLF + space (the continuation marker)
  return segments.join("\r\n ");
}

export async function exportTripToIcal(
  database: MyDatabase,
  tripId: string,
  timezone = "UTC",
): Promise<void> {
  const trip = await database.trips.findOne(tripId).exec();
  if (!trip) return;

  const stops = await database.stops
    .find({ selector: { tripId } })
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
    ...accommodations.flatMap((a) => [
      getDatePart(a.checkIn),
      getDatePart(a.checkOut),
    ]),
    ...transports.map((t) => getDatePart(t.departureDateTime)),
  ].filter(Boolean);

  const dtstamp = formatDtStamp(new Date());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Friend Zone Travel Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${timezone}`,
  ];

  if (allDates.length > 0) {
    const minDate = allDates.reduce((min, d) => (d < min ? d : min));
    const maxDate = allDates.reduce((max, d) => (d > max ? d : max));

    lines.push(
      "BEGIN:VEVENT",
      `UID:trip-${tripId}@friend-zone-travel-planner`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(minDate)}`,
      `DTEND;VALUE=DATE:${addOneDay(maxDate)}`,
      `SUMMARY:Trip: ${sanitizeText(trip.name)}`,
      "END:VEVENT",
    );
  }

  for (const transport of transports) {
    const tz = transport.timezone || timezone;
    const depDateStr = getDatePart(transport.departureDateTime);
    const depTimeStr = getTimePart(transport.departureDateTime);

    if (transport.arrivalDateTime) {
      // Both departure and arrival are known — emit timed DTSTART + DTEND.
      const arrDateStr = getDatePart(transport.arrivalDateTime);
      const arrTimeStr = getTimePart(transport.arrivalDateTime);
      lines.push(
        "BEGIN:VEVENT",
        `UID:transport-${transport.id}@friend-zone-travel-planner`,
        `DTSTAMP:${dtstamp}`,
        dtProp("DTSTART", depDateStr, depTimeStr, tz),
        dtProp("DTEND", arrDateStr, arrTimeStr, tz),
        `SUMMARY:${sanitizeText(transport.name)} (${transport.type})`,
        "END:VEVENT",
      );
    } else if (depTimeStr) {
      // Only departure time known — emit timed DTSTART with a 1-hour default duration.
      // (RFC 5545: DTSTART DATETIME + DURATION avoids a mixed DATE/DATETIME violation.)
      lines.push(
        "BEGIN:VEVENT",
        `UID:transport-${transport.id}@friend-zone-travel-planner`,
        `DTSTAMP:${dtstamp}`,
        dtProp("DTSTART", depDateStr, depTimeStr, tz),
        "DURATION:PT1H",
        `SUMMARY:${sanitizeText(transport.name)} (${transport.type})`,
        "END:VEVENT",
      );
    } else {
      // No times at all — emit an all-day event.
      lines.push(
        "BEGIN:VEVENT",
        `UID:transport-${transport.id}@friend-zone-travel-planner`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${formatIcalDate(depDateStr)}`,
        `DTEND;VALUE=DATE:${addOneDay(depDateStr)}`,
        `SUMMARY:${sanitizeText(transport.name)} (${transport.type})`,
        "END:VEVENT",
      );
    }
  }

  for (const accommodation of accommodations) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:accommodation-${accommodation.id}@friend-zone-travel-planner`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${formatIcalDate(getDatePart(accommodation.checkIn))}`,
      `DTEND;VALUE=DATE:${addOneDay(getDatePart(accommodation.checkOut))}`,
      `SUMMARY:${sanitizeText(accommodation.name)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  const icalContent = lines.map(foldLine).join("\r\n");

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

import type { Friend } from './types';
import ICAL from 'ical.js';
import ical, { ICalEventTransparency } from 'ical-generator';

// Generate iCal file content for a single friend
export function generateFriendIcal(friend: Friend): string {
  const now = new Date();

  const calendar = ical({ name: `${friend.name}'s Availability` });
  // Add each available date as an event
  friend.availableDates.forEach((date) => {
    calendar.createEvent({
      start: date,
      // TODO: Don't support partial days yet.
      allDay: true,
      created: now,
      description: `${friend.name} is available on this day`,
      summary: `${friend.name} Available`,
      transparency: ICalEventTransparency.TRANSPARENT,
      location: friend.address,
    });
  });

  return calendar.toString();
}

// Generate combined iCal file for all friends
export function generateCombinedIcal(tripName: string, friends: Friend[]): string {
  const now = new Date();
  const calendar = ical({ name: `${tripName} Availability` });

  friends.forEach((friend) => {
    friend.availableDates.forEach((date) => {
      calendar.createEvent({
        start: date,
        allDay: true,
        created: now,
        description: `${friend.name} is available on this day`,
        summary: `${friend.name} Available`,
        location: friend.address,
        transparency: ICalEventTransparency.TRANSPARENT,
      });
    });
  });

  return calendar.toString();
}

// Parse iCal file content
export async function parseIcalFile(
  file: File
): Promise<{ name: string; dates: Date[], location?: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const calData = ICAL.parse(content);
        const calendar = new ICAL.Component(calData);
        const events = calendar.getAllSubcomponents('vevent');

        const name = (calendar.getFirstPropertyValue('x-wr-calname') ||
          file.name.replace(/\.ics$/, '')) as string;

        const dates: Date[] = [];

        let location: string | undefined = undefined;
        events.forEach((event) => {
          const dtstart = event.getFirstPropertyValue('dtstart') as ICAL.Time;
          if (dtstart) {
            dates.push(dtstart.toJSDate() as Date);
          }
          const locationProp = event.getFirstPropertyValue('location') as string;
          if (locationProp) {
            location = locationProp;
          }
        });

        resolve({ name, dates, location });
      } catch (error) {
        reject(new Error('Failed to parse iCal file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

// Download file helper
export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

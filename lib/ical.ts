import type { Friend } from './types';
import { format } from 'date-fns';
import ical, { ICalEventTransparency } from 'ical-generator';

// Generate iCal file content for a single friend
export function generateFriendIcal(friend: Friend): string {
  const now = new Date();

  const calendar = ical({name: `${friend.name}'s Availability`});
  // Add each available date as an event
  friend.availableDates.forEach((date) => {
    calendar.createEvent({
      start: date,
      // TODO: Don't support partial days yet.
      allDay: true,
      created: now,
      description: `${friend.name} is available on this day`,
      summary: `${friend.name} Available`,
      transparency: ICalEventTransparency.TRANSPARENT
    });
  });

  return calendar.toString();
}

// Generate combined iCal file for all friends
export function generateCombinedIcal(friends: Friend[]): string {
  const now = new Date();
  const calendar = ical({ name: 'Combined Friend Availability' });

  friends.forEach((friend) => {
    friend.availableDates.forEach((date) => {
      calendar.createEvent({
        start: date,
        allDay: true,
        created: now,
        description: `${friend.name} is available on this day`,
        summary: `${friend.name} Available`,
        transparency: ICalEventTransparency.TRANSPARENT,
      });
    });
  });

  return calendar.toString();
}

// Parse iCal file content
export async function parseIcalFile(
  file: File
): Promise<{ name: string; dates: Date[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split(/\r\n|\n|\r/);

        let name = file.name.replace(/\.ics$/, '');
        const dates: Date[] = [];
        let inEvent = false;
        let currentDate: Date | null = null;

        // Extract calendar name if available
        const calNameLine = lines.find((line) =>
          line.startsWith('X-WR-CALNAME:')
        );
        if (calNameLine) {
          name = calNameLine.substring(12).replace(/'s Availability$/, '');
        }

        // Parse events
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line === 'BEGIN:VEVENT') {
            inEvent = true;
            currentDate = null;
          } else if (line === 'END:VEVENT') {
            inEvent = false;
            if (currentDate) {
              dates.push(currentDate);
            }
          } else if (inEvent && line.startsWith('DTSTART;VALUE=DATE:')) {
            const dateStr = line.substring(19);
            const year = Number.parseInt(dateStr.substring(0, 4));
            const month = Number.parseInt(dateStr.substring(4, 6)) - 1;
            const day = Number.parseInt(dateStr.substring(6, 8));
            currentDate = new Date(year, month, day);
          }
        }

        resolve({ name, dates });
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

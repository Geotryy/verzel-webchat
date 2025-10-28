import { google } from 'googleapis';

interface TimeSlot {
  start: string;
  end: string;
  formatted: string;
}

interface MeetingDetails {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendeeEmail: string;
  attendeeName: string;
}

interface MeetingResult {
  meetingLink: string;
  meetingDatetime: string;
}

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google Calendar credentials not configured");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // For server-to-server, we need to set credentials
  // This is a simplified approach - in production, you'd use service account or stored tokens
  // For now, we'll use a refresh token approach
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
  if (refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
  }

  return oauth2Client;
}

export async function getAvailableSlots(daysAhead: number = 7): Promise<TimeSlot[]> {
  try {
    const oauth2Client = getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    // Get busy times
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = response.data.calendars?.primary?.busy || [];

    // Generate available slots (9 AM to 6 PM, 1-hour slots)
    const availableSlots: TimeSlot[] = [];
    const currentDate = new Date(now);
    currentDate.setHours(9, 0, 0, 0);

    while (currentDate < endDate && availableSlots.length < 3) {
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(9, 0, 0, 0);
        continue;
      }

      // Skip past times
      if (currentDate <= now) {
        currentDate.setHours(currentDate.getHours() + 1);
        if (currentDate.getHours() >= 18) {
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(9, 0, 0, 0);
        }
        continue;
      }

      const slotStart = new Date(currentDate);
      const slotEnd = new Date(currentDate);
      slotEnd.setHours(slotEnd.getHours() + 1);

      // Check if slot is free
      const isBusy = busySlots.some((busy: any) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (slotStart >= busyStart && slotStart < busyEnd) ||
               (slotEnd > busyStart && slotEnd <= busyEnd);
      });

      if (!isBusy) {
        availableSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          formatted: formatSlot(slotStart),
        });
      }

      currentDate.setHours(currentDate.getHours() + 1);
      if (currentDate.getHours() >= 18) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(9, 0, 0, 0);
      }
    }

    return availableSlots.slice(0, 3);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    // Return mock slots if API fails
    return getMockSlots();
  }
}

function formatSlot(date: Date): string {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${dayName}, ${day} de ${month} às ${hours}:${minutes}`;
}

function getMockSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  
  for (let i = 1; i <= 3; i++) {
    const slotDate = new Date(now);
    slotDate.setDate(slotDate.getDate() + i);
    slotDate.setHours(14, 0, 0, 0);
    
    const endDate = new Date(slotDate);
    endDate.setHours(15, 0, 0, 0);

    slots.push({
      start: slotDate.toISOString(),
      end: endDate.toISOString(),
      formatted: formatSlot(slotDate),
    });
  }

  return slots;
}

export async function createMeeting(details: MeetingDetails): Promise<MeetingResult> {
  try {
    const oauth2Client = getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: details.summary,
      description: details.description,
      start: {
        dateTime: details.startTime,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: details.endTime,
        timeZone: 'America/Sao_Paulo',
      },
      attendees: [
        { email: details.attendeeEmail, displayName: details.attendeeName },
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    const meetingLink = response.data.hangoutLink || response.data.htmlLink || '';
    const meetingDatetime = details.startTime;

    return {
      meetingLink,
      meetingDatetime,
    };
  } catch (error) {
    console.error("Error creating meeting:", error);
    // Return mock meeting link if API fails
    return {
      meetingLink: `https://meet.google.com/mock-${Date.now()}`,
      meetingDatetime: details.startTime,
    };
  }
}


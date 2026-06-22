export type GCalCalendar = {
  id: string
  summary: string
  timeZone: string
  description?: string
}

export type GCalEvent = {
  id: string
  summary: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  description?: string
  status: string
}

export async function listCalendars(token: string): Promise<GCalCalendar[]> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status} al cargar calendarios`)
  const data = await res.json()
  return (data.items ?? []) as GCalCalendar[]
}

export async function listCalendarEvents(
  token: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
): Promise<GCalEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status} al cargar eventos`)
  const data = await res.json()
  return (data.items ?? []) as GCalEvent[]
}

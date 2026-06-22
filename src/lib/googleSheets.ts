import { format, parseISO } from 'date-fns'
import type { Professional, Patient } from '@/types/app'

const SPREADSHEET_ID = '1Mcg7IK2nJqvFT1iL7dQUcWMQHVdLrENdJPKr9IOyvJ4'
const API = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`

export const SHEET_TABS = {
  turnos: 'App-Turnos',
  profesionales: 'App-Profesionales',
  pacientes: 'App-Pacientes',
} as const

const HEADERS = {
  [SHEET_TABS.turnos]: ['ID', 'Tipo', 'Fecha', 'Inicio', 'Fin', 'Consultorio', 'Profesional', 'Paciente', 'Estado Pago', 'Duración', 'Notas'],
  [SHEET_TABS.profesionales]: ['ID', 'Nombre', 'Teléfono', 'Email', 'Especialidad', 'Matrícula', 'Notas'],
  [SHEET_TABS.pacientes]: ['ID', 'Nombre', 'Teléfono', 'Cobertura', 'Notas'],
}

const COL_WIDTHS: Record<string, number> = {
  [SHEET_TABS.turnos]: 11,
  [SHEET_TABS.profesionales]: 7,
  [SHEET_TABS.pacientes]: 5,
}

function lastCol(tab: string): string {
  return String.fromCharCode(64 + (COL_WIDTHS[tab] ?? 1))
}

// Wrap sheet name in single quotes so hyphens are handled correctly by the API
function q(tab: string): string {
  return `'${tab}'`
}

async function req(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Sheets ${res.status}: ${JSON.stringify(body)}`)
  }
  return res.json() as Promise<Record<string, unknown>>
}

async function getValues(token: string, range: string): Promise<string[][]> {
  const data = await req(token, `/values/${encodeURIComponent(range)}`)
  return (data.values as string[][] | undefined) ?? []
}

async function setValues(token: string, range: string, values: string[][]) {
  await req(token, `/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    body: JSON.stringify({ values }),
  })
}

async function appendValues(token: string, range: string, values: string[][]) {
  await req(token, `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: JSON.stringify({ values }),
  })
}

async function batchUpdate(token: string, requests: unknown[]) {
  await req(token, ':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({ requests }),
  })
}

async function getSheetTitles(token: string): Promise<string[]> {
  const data = await req(token, '?fields=sheets.properties.title')
  return ((data.sheets as Array<{ properties: { title: string } }>) ?? []).map((s) => s.properties.title)
}

async function findRow(token: string, tab: string, id: string): Promise<number | null> {
  const values = await getValues(token, `${q(tab)}!A:A`)
  const idx = values.findIndex((row) => row[0] === id)
  return idx === -1 ? null : idx + 1
}

export async function initSheets(token: string) {
  const titles = await getSheetTitles(token)
  const toAdd = Object.values(SHEET_TABS).filter((t) => !titles.includes(t))
  if (toAdd.length > 0) {
    await batchUpdate(token, toAdd.map((title) => ({ addSheet: { properties: { title } } })))
  }
  for (const [tab, headers] of Object.entries(HEADERS)) {
    const existing = await getValues(token, `${q(tab)}!A1:A1`)
    if (!existing.length || existing[0][0] !== 'ID') {
      await setValues(token, `${q(tab)}!1:1`, [headers])
    }
  }
}

// --- Profesionales ---

function professionalToRow(p: Professional): string[] {
  return [p.id, p.full_name, p.phone ?? '', p.email ?? '', p.specialty ?? '', p.license_num ?? '', p.notes ?? '']
}

export async function syncProfessional(token: string, p: Professional, op: 'upsert' | 'delete') {
  const tab = SHEET_TABS.profesionales
  const lc = lastCol(tab)
  const cols = COL_WIDTHS[tab]
  const row = await findRow(token, tab, p.id)
  if (op === 'delete') {
    if (row) await setValues(token, `${q(tab)}!A${row}:${lc}${row}`, [Array(cols).fill('')])
    return
  }
  const data = [professionalToRow(p)]
  if (row) await setValues(token, `${q(tab)}!A${row}:${lc}${row}`, data)
  else await appendValues(token, `${q(tab)}!A:${lc}`, data)
}

export async function exportProfessionals(token: string, professionals: Professional[]) {
  const tab = SHEET_TABS.profesionales
  const lc = lastCol(tab)
  const rows = [HEADERS[tab], ...professionals.map(professionalToRow)]
  await setValues(token, `${q(tab)}!A1:${lc}${rows.length}`, rows)
}

// --- Pacientes ---

function patientToRow(p: Patient): string[] {
  return [p.id, p.full_name, p.phone ?? '', p.coverage ?? '', p.notes ?? '']
}

export async function syncPatient(token: string, p: Patient, op: 'upsert' | 'delete') {
  const tab = SHEET_TABS.pacientes
  const lc = lastCol(tab)
  const cols = COL_WIDTHS[tab]
  const row = await findRow(token, tab, p.id)
  if (op === 'delete') {
    if (row) await setValues(token, `${q(tab)}!A${row}:${lc}${row}`, [Array(cols).fill('')])
    return
  }
  const data = [patientToRow(p)]
  if (row) await setValues(token, `${q(tab)}!A${row}:${lc}${row}`, data)
  else await appendValues(token, `${q(tab)}!A:${lc}`, data)
}

export async function exportPatients(token: string, patients: Patient[]) {
  const tab = SHEET_TABS.pacientes
  const lc = lastCol(tab)
  const rows = [HEADERS[tab], ...patients.map(patientToRow)]
  await setValues(token, `${q(tab)}!A1:${lc}${rows.length}`, rows)
}

// --- Turnos ---

export type AppointmentSyncData = {
  id: string
  type: 'derivacion' | 'alquiler'
  start_time: string
  end_time: string
  consultorio_name: string
  professional_name: string
  patient_name: string
  payment_status: 'pending' | 'paid'
  rental_duration?: string | null
  notes?: string | null
}

function appointmentToRow(a: AppointmentSyncData): string[] {
  return [
    a.id,
    a.type === 'derivacion' ? 'Derivación' : 'Alquiler',
    format(parseISO(a.start_time), 'dd/MM/yyyy'),
    format(parseISO(a.start_time), 'HH:mm'),
    format(parseISO(a.end_time), 'HH:mm'),
    a.consultorio_name,
    a.professional_name,
    a.patient_name,
    a.payment_status === 'paid' ? 'Pagado' : 'Pendiente',
    a.rental_duration ?? '',
    a.notes ?? '',
  ]
}

export async function syncAppointment(token: string, a: AppointmentSyncData, op: 'upsert' | 'delete') {
  const tab = SHEET_TABS.turnos
  const lc = lastCol(tab)
  const cols = COL_WIDTHS[tab]
  const row = await findRow(token, tab, a.id)
  if (op === 'delete') {
    if (row) await setValues(token, `${q(tab)}!A${row}:${lc}${row}`, [Array(cols).fill('')])
    return
  }
  const data = [appointmentToRow(a)]
  if (row) await setValues(token, `${q(tab)}!A${row}:${lc}${row}`, data)
  else await appendValues(token, `${q(tab)}!A:${lc}`, data)
}

export async function exportAppointments(token: string, appointments: AppointmentSyncData[]) {
  const tab = SHEET_TABS.turnos
  const lc = lastCol(tab)
  const rows = [HEADERS[tab], ...appointments.map(appointmentToRow)]
  await setValues(token, `${q(tab)}!A1:${lc}${rows.length}`, rows)
}

// --- Import from Sheets ---

export type SheetProfessional = { id: string; full_name: string; phone: string; email: string; specialty: string; license_num: string; notes: string }
export type SheetPatient = { id: string; full_name: string; phone: string; coverage: string; notes: string }

export async function importProfessionalsFromSheet(token: string): Promise<SheetProfessional[]> {
  const values = await getValues(token, `${q(SHEET_TABS.profesionales)}!A:G`)
  return values
    .slice(1)
    .filter((row) => row[0] && row[0] !== 'ID')
    .map((row) => ({
      id: row[0] ?? '',
      full_name: row[1] ?? '',
      phone: row[2] ?? '',
      email: row[3] ?? '',
      specialty: row[4] ?? '',
      license_num: row[5] ?? '',
      notes: row[6] ?? '',
    }))
}

export async function importPatientsFromSheet(token: string): Promise<SheetPatient[]> {
  const values = await getValues(token, `${q(SHEET_TABS.pacientes)}!A:E`)
  return values
    .slice(1)
    .filter((row) => row[0] && row[0] !== 'ID')
    .map((row) => ({
      id: row[0] ?? '',
      full_name: row[1] ?? '',
      phone: row[2] ?? '',
      coverage: row[3] ?? '',
      notes: row[4] ?? '',
    }))
}

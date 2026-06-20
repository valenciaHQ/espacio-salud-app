-- ============================================================
-- 0. Extensions
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. consultorios (rooms)
-- ============================================================
create table public.consultorios (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  color       text not null default '#3b82f6',
  position    smallint not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- 2. professionals
-- ============================================================
create table public.professionals (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  phone        text,
  email        text,
  specialty    text,
  license_num  text,
  notes        text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- ============================================================
-- 3. patients
-- ============================================================
create table public.patients (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  phone        text,
  coverage     text,
  notes        text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- ============================================================
-- 4. appointments
-- ============================================================
create type public.appointment_type as enum ('derivacion', 'alquiler');
create type public.rental_duration  as enum ('1h', '4h', 'full_day');
create type public.payment_status   as enum ('pending', 'paid');

create table public.appointments (
  id               uuid primary key default uuid_generate_v4(),
  type             public.appointment_type not null,
  consultorio_id   uuid not null references public.consultorios(id),

  start_time       timestamptz not null,
  end_time         timestamptz not null,

  payment_status   public.payment_status not null default 'pending',
  amount           numeric(10,2),
  notes            text,

  patient_id       uuid references public.patients(id),
  professional_id  uuid references public.professionals(id),
  rental_duration  public.rental_duration,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,

  constraint chk_time_order check (end_time > start_time),
  constraint chk_derivacion check (
    type != 'derivacion' or (patient_id is not null and professional_id is not null)
  ),
  constraint chk_alquiler check (
    type != 'alquiler' or (professional_id is not null and rental_duration is not null)
  )
);

-- Prevent overlapping bookings in same room
create or replace function public.check_appointment_overlap()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.appointments
    where consultorio_id = new.consultorio_id
      and id != new.id
      and deleted_at is null
      and (start_time, end_time) overlaps (new.start_time, new.end_time)
  ) then
    raise exception 'Ya existe un turno en ese consultorio para ese horario';
  end if;
  return new;
end;
$$;

create trigger trg_appointment_overlap
  before insert or update on public.appointments
  for each row execute function public.check_appointment_overlap();

-- ============================================================
-- 5. settings
-- ============================================================
create table public.settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('operating_hours', '{"start": "08:00", "end": "20:00"}'),
  ('business_name',   '"Espacio Salud"');

-- ============================================================
-- 6. Seed consultorios
-- ============================================================
insert into public.consultorios (name, color, position) values
  ('Consultorio 1', '#3b82f6', 1),
  ('Consultorio 2', '#10b981', 2),
  ('Consultorio 3', '#f59e0b', 3);

-- ============================================================
-- 7. updated_at triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_consultorios_updated_at
  before update on public.consultorios
  for each row execute function public.set_updated_at();

create trigger trg_professionals_updated_at
  before update on public.professionals
  for each row execute function public.set_updated_at();

create trigger trg_patients_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

create trigger trg_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- ============================================================
-- 8. Row Level Security
-- ============================================================
alter table public.consultorios  enable row level security;
alter table public.professionals enable row level security;
alter table public.patients      enable row level security;
alter table public.appointments  enable row level security;
alter table public.settings      enable row level security;

create policy "Admin full access" on public.consultorios
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on public.professionals
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on public.patients
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on public.appointments
  for all using (auth.role() = 'authenticated');

create policy "Admin full access" on public.settings
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- 9. Indexes
-- ============================================================
create index idx_appointments_consultorio_time
  on public.appointments (consultorio_id, start_time, end_time)
  where deleted_at is null;

create index idx_appointments_professional
  on public.appointments (professional_id)
  where deleted_at is null;

create index idx_appointments_patient
  on public.appointments (patient_id)
  where deleted_at is null;

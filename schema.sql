create extension if not exists pgcrypto;

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  location_name text not null,
  country text,
  lat double precision not null check (lat >= -90 and lat <= 90),
  lng double precision not null check (lng >= -180 and lng <= 180),
  year int not null,
  image_url text not null,
  explanation text,
  geo_clues text,
  time_clues text,
  validation_notes text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  source_type text not null default 'manual' check (source_type in ('manual', 'ai', 'archive')),
  difficulty int default 1 check (difficulty >= 1 and difficulty <= 5),
  approved boolean default false,
  created_at timestamp default now()
);

alter table public.rounds add column if not exists geo_clues text;
alter table public.rounds add column if not exists time_clues text;
alter table public.rounds add column if not exists validation_notes text;
alter table public.rounds add column if not exists status text not null default 'draft';
alter table public.rounds add column if not exists source_type text not null default 'manual';

create index if not exists rounds_approved_idx on public.rounds (approved);
create index if not exists rounds_status_idx on public.rounds (status);
create index if not exists rounds_created_at_idx on public.rounds (created_at desc);

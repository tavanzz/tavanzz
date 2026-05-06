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
  difficulty int default 1 check (difficulty >= 1 and difficulty <= 5),
  approved boolean default false,
  created_at timestamp default now()
);

create index if not exists rounds_approved_idx on public.rounds (approved);
create index if not exists rounds_created_at_idx on public.rounds (created_at desc);

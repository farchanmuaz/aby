-- ─────────────────────────────────────────────────────────────────────────
-- arabiyya — database schema
-- Run this in Supabase SQL editor (Project → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────

-- Jilids (books)
create table if not exists jilids (
  id          text primary key,
  name        text not null,
  level       text,
  unit_count  int  default 0,
  accent      text default '#292929',
  locked      boolean default false,
  resume_unit int,
  resume_progress float
);

-- Units
create table if not exists units (
  id        text primary key,
  jilid_id  text references jilids(id) on delete cascade,
  num       int  not null,
  title     text not null,
  sub       text,
  status    text default 'todo',   -- 'todo' | 'current' | 'done'
  words     int  default 0,
  progress  float default 0
);

-- Materi (lesson content blocks)
create table if not exists materi (
  id         text primary key,
  jilid_id   text references jilids(id) on delete cascade,
  unit_num   int,
  type       text not null,   -- 'heading' | 'paragraph' | 'dialog' | 'note' | 'image'
  text       text,
  title      text,
  caption    text,
  lines      jsonb,           -- dialog: [{speaker, text}, ...]
  sort_order int default 0
);

-- Kamus (dictionary)
create table if not exists kamus (
  id       text primary key,
  jilid_id text references jilids(id) on delete cascade,
  unit_num int,
  kalimah  text not null,
  sharh    text not null,
  jam      text,
  mufrad   text,
  muradif  text,
  didh     text,
  mithal   text,
  tashrif  jsonb,             -- {madhi, mudhari, masdar} or null
  has_img  boolean default false
);

-- Activity log
create table if not exists activity (
  id         bigserial primary key,
  type       text,            -- 'add' | 'edit' | 'delete' | 'image'
  who        text default 'admin',
  what       text,
  color      text,
  created_at timestamptz default now()
);

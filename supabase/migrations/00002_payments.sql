-- Haqqi migration 00002 — paid case assistance (PRD business model update):
-- JOD 30 per accident case, CliQ-only. Users submit a transfer reference;
-- an admin verifies it against the platform's CliQ account and confirms.

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  amount_jod numeric(8,2) not null default 30,
  case_label text,
  cliq_reference text not null check (char_length(cliq_reference) between 4 and 60),
  sender_name text not null check (char_length(sender_name) between 3 and 120),
  status text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_user on payments(user_id);

alter table payments enable row level security;

-- Owner can see their own submissions and create new pending ones.
-- Confirmation/rejection happens exclusively via the service-role key (admin).
create policy payments_owner_select on payments
  for select to authenticated using (auth.uid() = user_id);
create policy payments_owner_insert on payments
  for insert to authenticated with check (auth.uid() = user_id and status = 'pending');

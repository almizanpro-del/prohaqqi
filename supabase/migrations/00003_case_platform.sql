-- ============================================================================
-- Haqqi migration 00003 — Case platform (multi-user cases, deadlines,
-- evidence custody, notifications, feedback, lawyer onboarding, audits)
--
-- Implements the "critical" product gaps:
--   1. Multi-user case access (owner / family representative / lawyer)
--   2. Unified "My Case" model backing the dashboard
--   3. Hard-deadline (statute of limitations) tracker rows
--   4. Lawyer verification/onboarding applications
--   5. (PII handling is enforced in application code — src/lib/pii.ts)
--   6. Canonical audit logging via triggers on sensitive tables
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Cases + shared access
-- ---------------------------------------------------------------------------

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references users(id) on delete cascade,
  label text not null default '' ,
  accident_date date,
  injuries text check (injuries in ('none','minor','severe','death')),
  status text not null default 'active' check (status in ('active','closed','archived')),
  stage text not null default 'intake' check (stage in ('intake','planning','evidence','drafting','escalation','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_cases_creator on cases(created_by);

create table if not exists case_access (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  invited_email text,
  role text not null check (role in ('owner','family_rep','lawyer','viewer')),
  status text not null default 'pending_invite' check (status in ('pending_invite','active','revoked')),
  granted_by uuid references users(id),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (case_id, user_id),
  unique (case_id, invited_email)
);
create index if not exists idx_case_access_user on case_access(user_id);

alter table cases enable row level security;
alter table case_access enable row level security;

create policy cases_member_select on cases
  for select to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from case_access ca
      where ca.case_id = cases.id and ca.user_id = auth.uid() and ca.status = 'active'
    )
  );

create policy cases_insert_owner on cases
  for insert to authenticated with check (created_by = auth.uid());

create policy cases_update_owner on cases
  for update to authenticated using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy case_access_member_select on case_access
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from case_access me
      where me.case_id = case_access.case_id and me.user_id = auth.uid()
        and me.status = 'active' and me.role in ('owner','family_rep')
    )
  );

create policy case_access_owner_manage on case_access
  for insert to authenticated
  with check (
    role <> 'owner'
    and exists (
      select 1 from cases c
      where c.id = case_id and c.created_by = auth.uid()
    )
  );

create policy case_access_owner_update on case_access
  for update to authenticated
  using (
    exists (select 1 from cases c where c.id = case_id and c.created_by = auth.uid())
    -- invited user may accept their own pending invite
    or (user_id = auth.uid() and status = 'pending_invite')
  );

create policy case_access_invited_self_insert on case_access
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'active');

-- ---------------------------------------------------------------------------
-- Hard-deadline tracker (statute of limitations etc.)
-- ---------------------------------------------------------------------------

create table if not exists deadlines (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  kind text not null check (kind in ('limitation_3y','fund_1y','payment_window','custom')),
  title text not null,
  due_date date not null,
  notes text,
  completed_at timestamptz,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  unique (case_id, kind, due_date)
);
create index if not exists idx_deadlines_case_due on deadlines(case_id, due_date);

alter table deadlines enable row level security;

create policy deadlines_member_all on deadlines
  for all to authenticated
  using (
    exists (
      select 1 from case_access ca
      join cases c on c.id = ca.case_id
      where ca.case_id = deadlines.case_id
        and ca.status = 'active'
        and (ca.user_id = auth.uid() or c.created_by = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from case_access ca
      join cases c on c.id = ca.case_id
      where ca.case_id = deadlines.case_id
        and ca.status = 'active'
        and (ca.user_id = auth.uid() or c.created_by = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Documents: extend with chain-of-custody metadata
-- ---------------------------------------------------------------------------

alter table documents
  add column if not exists case_id uuid references cases(id) on delete cascade,
  add column if not exists original_name text,
  add column if not exists size_bytes bigint,
  add column if not exists mime_type text,
  add column if not exists sha256 char(64);

create index if not exists idx_documents_case on documents(case_id);

-- ---------------------------------------------------------------------------
-- Notifications (in-app center)
-- ---------------------------------------------------------------------------

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  kind text not null default 'info',
  title_ar text not null,
  title_en text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);

alter table notifications enable row level security;

create policy notifications_owner_select on notifications
  for select to authenticated using (user_id = auth.uid());
create policy notifications_owner_update on notifications
  for update to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- AI answer feedback (thumbs up/down quality signal)
-- ---------------------------------------------------------------------------

create table if not exists ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  context text not null check (context in ('intake','draft','rag')),
  ref_id text,
  rating text not null check (rating in ('up','down')),
  comment text,
  created_at timestamptz not null default now()
);

alter table ai_feedback enable row level security;

create policy ai_feedback_owner_all on ai_feedback
  for all to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Consent versioning (PDPL + disclaimer defense)
-- ---------------------------------------------------------------------------

alter table user_consents
  add column if not exists doc_type text,
  add column if not exists doc_version int;

-- ---------------------------------------------------------------------------
-- Lawyer verification/onboarding
-- ---------------------------------------------------------------------------

alter table lawyers
  add column if not exists user_id uuid references users(id);

create unique index if not exists idx_lawyers_user on lawyers(user_id) where user_id is not null;

create table if not exists lawyer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  full_name text not null,
  bar_number text not null,
  bar_association text not null default 'نقابة المحامين النظاميين الأردنيين',
  license_sha256 char(64),
  license_original_name text,
  id_document_sha256 char(64),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table lawyer_applications enable row level security;

create policy lawyer_apps_owner_select on lawyer_applications
  for select to authenticated using (user_id = auth.uid());
create policy lawyer_apps_owner_insert on lawyer_applications
  for insert to authenticated with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Platform admins (service-role gated; no public policies)
-- ---------------------------------------------------------------------------

create table if not exists admins (
  user_id uuid primary key references users(id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Canonical audit trail: triggers on sensitive tables
-- ---------------------------------------------------------------------------

create or replace function audit_write() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_uid text;
  v_row jsonb;
begin
  begin
    v_uid := coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub')
    );
    v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
    insert into audit_logs (user_id, action, entity, entity_id, metadata)
    values (
      nullif(v_uid, '')::uuid,
      lower(tg_op),
      tg_table_name,
      (v_row ->> 'id')::uuid,
      jsonb_build_object('row', v_row)
    );
  exception when others then
    -- auditing must never break the underlying operation
    null;
  end;
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'payments','documents','case_access','cases','drafts',
    'stories','legal_guides','lawyer_applications','deletion_requests','complaints'
  ] loop
    execute format('drop trigger if exists %I_audit on %I', t, t);
    execute format(
      'create trigger %I_audit after insert or update or delete on %I
       for each row execute function audit_write()', t, t
    );
  end loop;
end $$;

-- Keep updated_at fresh on cases
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists cases_touch on cases;
create trigger cases_touch before update on cases
for each row execute function touch_updated_at();

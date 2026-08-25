-- ============================================================================
-- Haqqi (حقي) — Supabase initial migration
-- Implements PRD v3.0 §6.2 (data model) + §6.3 (security & compliance)
--
-- Usage:
--   supabase db push            (or run in the SQL editor / psql)
-- Requires: extensions below; pgvector is available on hosted Supabase.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Core identity & consent (PDPL No. 24/2023 — explicit, logged consents)
-- ---------------------------------------------------------------------------

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text,
  language text default 'ar' check (language in ('ar','en')),
  created_at timestamptz not null default now()
);

create table if not exists user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  consent_type text not null check (consent_type in ('data_processing','marketing','anonymized_sharing')),
  granted boolean not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_user_consents_user on user_consents(user_id);

-- PDPL right-to-erasure workflow (soft delete → purge after 30 days)
create table if not exists deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  details text,
  status text not null default 'received' check (status in ('received','processing','completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Audit log: every data access/modification event (PRD §6.3)
create table if not exists audit_logs (
  id bigserial primary key,
  user_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  ip_address inet,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Case data
-- ---------------------------------------------------------------------------

create table if not exists case_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  intake_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists accidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  accident_date date,
  location text,
  type text check (type in ('collision','hit_and_run','uninsured','other')) ,
  injuries text check (injuries in ('none','minor','severe','death')),
  other_party_insured boolean,
  created_at timestamptz not null default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  accident_id uuid references accidents(id) on delete cascade,
  insurer_name text,
  policy_number text,
  status text default 'pending' check (status in ('pending','approved','denied','delayed','paid','closed')),
  amount_claimed numeric(12,2),
  amount_offered numeric(12,2),
  amount_paid numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  type text not null,
  file_url text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists claim_logs (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  contact_date date,
  contact_person text,
  summary text,
  outcome text,
  created_at timestamptz not null default now()
);

create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete set null,
  target text not null check (target in ('insurer','cbj','court')),
  template_type text,
  content text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Drafting Mode (Phase 2) with versioning + citations + AI confidence
create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  case_intake_id uuid references case_intakes(id) on delete cascade,
  template_type text not null,
  version int not null default 1,
  content text,
  plain_arabic_version text,
  legal_arabic_version text,
  citations jsonb,
  ai_confidence_score numeric(3,2),
  lawyer_reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Community: anonymous stories & corruption reports
-- Public may INSERT only; SELECT restricted to approved rows / admins.
-- ---------------------------------------------------------------------------

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  accident_date date,
  insurer_name text,
  abuse_types text[] not null default '{}',
  outcome text not null default 'pending',
  description text not null check (char_length(description) between 30 and 4000),
  email text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists corruption_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date,
  location text,
  description text not null,
  evidence_urls text[],
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Phase 3: lawyers, engagement letters, court filings
-- ---------------------------------------------------------------------------

create table if not exists lawyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  firm text,
  location text,
  languages text[] default '{ar}',
  fee_model text check (fee_model in ('contingency','hourly','fixed','free')),
  expertise text[] default '{}',
  contact_email text,
  contact_phone text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists engagement_letters (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid references lawyers(id) on delete set null,
  user_id uuid references users(id) on delete cascade,
  template_type text check (template_type in ('contingency','hourly','fixed')),
  content text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists court_filings (
  id uuid primary key default gen_random_uuid(),
  case_intake_id uuid references case_intakes(id) on delete cascade,
  filing_type text check (filing_type in ('statement_of_claim','expert_request','enforcement_request')),
  content text,
  filed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RAG knowledge base (Phase 2): Jordanian law chunks + embeddings
-- ---------------------------------------------------------------------------

create table if not exists legal_documents (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text not null,
  source text not null,
  article_id text,
  topics text[] default '{}',
  language text default 'ar',
  embedding vector(768),
  created_at timestamptz not null default now()
);
create index if not exists idx_legal_docs_embedding on legal_documents
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_legal_docs_topics on legal_documents using gin (topics);
create index if not exists idx_legal_docs_article on legal_documents(article_id);

-- Static, lawyer-reviewed guides (MVP CMS target)
create table if not exists legal_guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content_md text not null,
  version int not null default 1,
  last_reviewed_by_lawyer text,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Seed guide placeholders (content authored by legal team via admin CMS)
insert into legal_guides (slug, title, content_md) values
  ('entitlements', 'ماذا أستحق؟ | What you are entitled to', 'TODO: lawyer-reviewed content (PRD §5.1.1)'),
  ('ceilings', 'سقوف التعويض | Compensation ceilings', 'TODO: sync from official CBJ tables'),
  ('deadlines', 'المواعيد النهائية | Deadlines', 'Art. 932 Civil Code (3y); Fund window (1y)')
on conflict (slug) do nothing;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table users              enable row level security;
alter table user_consents      enable row level security;
alter table deletion_requests  enable row level security;
alter table audit_logs         enable row level security;
alter table case_intakes       enable row level security;
alter table accidents          enable row level security;
alter table claims             enable row level security;
alter table documents          enable row level security;
alter table claim_logs         enable row level security;
alter table complaints         enable row level security;
alter table drafts             enable row level security;
alter table stories            enable row level security;
alter table corruption_reports enable row level security;
alter table lawyers            enable row level security;
alter table engagement_letters enable row level security;
alter table court_filings      enable row level security;
alter table legal_documents    enable row level security;
alter table legal_guides       enable row level security;

-- User-owned tables: owner CRUD via authenticated sessions
do $$
declare t text;
begin
  foreach t in array array[
    'case_intakes','accidents','claims','documents','claim_logs',
    'complaints','drafts','engagement_letters','court_filings'
  ] loop
    execute format($f$
      create policy %1$s_owner_all on %1$s
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id)
    $f$, t);
  end loop;
end $$;

create policy user_consents_owner_all on user_consents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Stories: anyone can submit anonymously; public reads approved only.
create policy stories_public_insert on stories
  for insert to anon, authenticated with check (true);
create policy stories_public_read_approved on stories
  for select to anon, authenticated using (is_approved = true);

-- Corruption reports: submit-only for the public; reads via service role/admin.
create policy corruption_reports_public_insert on corruption_reports
  for insert to anon, authenticated with check (is_anonymous);

-- Deletion requests: submit-only.
create policy deletion_requests_public_insert on deletion_requests
  for insert to anon, authenticated with check (true);

-- Lawyers directory: public read of verified profiles; admin writes via service role.
create policy lawyers_public_read_verified on lawyers
  for select to anon, authenticated using (is_verified = true);

-- Legal knowledge: public read; writes via service role (ingestion pipeline).
create policy legal_documents_public_read on legal_documents
  for select to anon, authenticated using (true);
create policy legal_guides_public_read on legal_guides
  for select to anon, authenticated using (true);

-- NOTE: service-role key bypasses RLS and is used exclusively server-side
-- (API routes) for moderation, ingestion and regulator exports.

-- ============================================================================
-- Storage: private bucket for user documents (signed URLs only)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

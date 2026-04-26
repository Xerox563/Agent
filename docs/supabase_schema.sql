create table if not exists candidates (
  id uuid primary key,
  email text not null,
  name text,
  experience numeric,
  role text,
  skills jsonb,
  status text,
  score integer,
  summary text,
  expected_salary text,
  notice_period text,
  availability_slot text,
  proposed_slots jsonb,
  gmail_message_id text,
  subject text,
  body text,
  attachments jsonb,
  followup_stage text default 'NONE',
  last_email_sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  from_email text,
  subject text,
  body text,
  classification text,
  has_attachment boolean default false,
  attachment_type text,
  status text,
  extracted_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  location text,
  status text default 'ACTIVE',
  recruiter text,
  requirements jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists automation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_enabled boolean default true,
  trigger text,
  action text,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  subject text,
  body text,
  variables jsonb default '[]'::jsonb,
  status text default 'ACTIVE',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  status text default 'DISCONNECTED',
  last_sync_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  scoring_config jsonb default '{}'::jsonb,
  notification_config jsonb default '{}'::jsonb,
  permissions_config jsonb default '{}'::jsonb,
  ai_config jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  metric text not null,
  value numeric,
  dimensions jsonb default '{}'::jsonb,
  measured_at timestamptz default now()
);

create table if not exists analytics_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  report_type text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists email_process_logs (
  id uuid primary key default gen_random_uuid(),
  payload jsonb default '{}'::jsonb,
  status text default 'QUEUED',
  created_at timestamptz default now()
);

create table if not exists integration_logs (
  id uuid primary key default gen_random_uuid(),
  payload jsonb default '{}'::jsonb,
  status text default 'REQUESTED',
  created_at timestamptz default now()
);

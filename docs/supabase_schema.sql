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
  gmail_message_id text,
  subject text,
  body text,
  attachments jsonb,
  created_at timestamptz default now()
);

-- Run this once in the Supabase SQL editor.

create table envelopes (
  id integer primary key,
  message text not null,
  opened boolean not null default false,
  opened_at timestamptz
);

insert into envelopes (id, message, opened) values
  (1, 'Replace this with your real message for envelope 1.', false),
  (2, 'Replace this with your real message for envelope 2.', false),
  (3, 'Replace this with your real message for envelope 3.', false);

-- Row Level Security: block all direct client access.
-- Only the Netlify Function (using the service role key) can read/write.
alter table envelopes enable row level security;

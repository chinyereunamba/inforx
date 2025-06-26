-- Create medical_summaries table
create table medical_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  summary_text text,
  conditions_identified text[],
  medications_mentioned text[],
  tests_performed text[],
  patterns_identified text[],
  risk_factors text[],
  recommendations text[],
  record_count int,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table medical_summaries enable row level security;

-- Create policy for users to only access their own summaries
create policy "Users can only access their own medical summaries"
  on medical_summaries
  for all
  using (auth.uid() = user_id);

-- Create index for better performance
create index idx_medical_summaries_user_id on medical_summaries(user_id);
create index idx_medical_summaries_created_at on medical_summaries(created_at);

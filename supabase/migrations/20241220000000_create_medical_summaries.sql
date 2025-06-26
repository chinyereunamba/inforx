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

-- Enable RLS
alter table medical_summaries enable row level security;

-- Create policy for users to access only their own summaries
create policy "Users can view their own medical summaries"
  on medical_summaries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own medical summaries"
  on medical_summaries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own medical summaries"
  on medical_summaries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own medical summaries"
  on medical_summaries for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index idx_medical_summaries_user_id on medical_summaries(user_id);
create index idx_medical_summaries_created_at on medical_summaries(created_at desc);
/*
  # Create logs table

  1. New Tables
    - `logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `logs` table
    - Add policies for access control
*/

-- Create logs table to track user actions
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Enable row-level security
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- 1. Users can view their own logs
CREATE POLICY "Users can view their own logs" 
  ON logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Insert policy - allow authenticated users to create logs of their own actions
CREATE POLICY "Users can insert their own logs" 
  ON logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Admin can view all logs (for future admin dashboard)
CREATE POLICY "Admins can view all logs"
  ON logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));
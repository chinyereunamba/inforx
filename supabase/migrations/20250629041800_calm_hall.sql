/*
  # Create Activity Logs Table

  1. New Table
    - `logs` - Stores user activity logs for tracking and auditing
  2. Security
    - Enable RLS on logs table
    - Add policy for users to view their own logs
    - Add policy for users to create their own logs
*/

-- Create logs table for tracking user activity
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS logs_user_id_idx ON logs(user_id);
CREATE INDEX IF NOT EXISTS logs_action_idx ON logs(action);
CREATE INDEX IF NOT EXISTS logs_created_at_idx ON logs(created_at);

-- Enable row level security
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own logs
CREATE POLICY "Users can view their own logs"
  ON logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own logs
CREATE POLICY "Users can create their own logs"
  ON logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for service roles to access all logs
CREATE POLICY "Service role can access all logs"
  ON logs
  USING (auth.role() = 'service_role');

-- Add function to automatically limit logs per user (keep last 1000)
CREATE OR REPLACE FUNCTION public.limit_user_logs()
RETURNS TRIGGER AS $$
DECLARE
  row_count INTEGER;
BEGIN
  -- Count logs for this user
  SELECT COUNT(*) INTO row_count
  FROM logs
  WHERE user_id = NEW.user_id;
  
  -- If more than 1000 logs, delete oldest ones
  IF row_count > 1000 THEN
    DELETE FROM logs
    WHERE id IN (
      SELECT id FROM logs
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT (row_count - 1000)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to limit logs per user
CREATE TRIGGER limit_user_logs_trigger
AFTER INSERT ON logs
FOR EACH ROW
EXECUTE FUNCTION public.limit_user_logs();

-- Add comment to the table
COMMENT ON TABLE logs IS 'User activity logs for tracking and auditing purposes';
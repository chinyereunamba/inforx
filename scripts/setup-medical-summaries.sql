-- =====================================================
-- Medical Summaries Feature Setup Script
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create the medical_summaries table
CREATE TABLE IF NOT EXISTS medical_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  conditions_identified TEXT[],
  medications_mentioned TEXT[],
  tests_performed TEXT[],
  patterns_identified TEXT[],
  risk_factors TEXT[],
  recommendations TEXT[],
  record_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_summaries_user_id ON medical_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_summaries_created_at ON medical_summaries(created_at);

-- 3. Enable Row Level Security
ALTER TABLE medical_summaries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Users can only see their own summaries
CREATE POLICY "Users can view their own medical summaries" ON medical_summaries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own summaries
CREATE POLICY "Users can insert their own medical summaries" ON medical_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own summaries
CREATE POLICY "Users can update their own medical summaries" ON medical_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own summaries
CREATE POLICY "Users can delete their own medical summaries" ON medical_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create function to automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION update_medical_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to automatically update last_updated
CREATE TRIGGER update_medical_summaries_updated_at
  BEFORE UPDATE ON medical_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_summary_updated_at();

-- 7. Create a function to get or create user's medical summary
CREATE OR REPLACE FUNCTION get_or_create_medical_summary(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  summary_text TEXT,
  conditions_identified TEXT[],
  medications_mentioned TEXT[],
  tests_performed TEXT[],
  patterns_identified TEXT[],
  risk_factors TEXT[],
  recommendations TEXT[],
  record_count INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.id,
    ms.summary_text,
    ms.conditions_identified,
    ms.medications_mentioned,
    ms.tests_performed,
    ms.patterns_identified,
    ms.risk_factors,
    ms.recommendations,
    ms.record_count,
    ms.last_updated,
    ms.created_at
  FROM medical_summaries ms
  WHERE ms.user_id = user_uuid
  ORDER BY ms.last_updated DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON medical_summaries TO authenticated;

-- 9. Create a view for easier querying (optional)
CREATE OR REPLACE VIEW user_medical_summaries_view AS
SELECT 
  ms.*,
  u.email as user_email
FROM medical_summaries ms
JOIN auth.users u ON ms.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON user_medical_summaries_view TO authenticated;

-- =====================================================
-- Setup Complete!
-- =====================================================

-- Test the setup by checking if the table exists
SELECT 
  'Medical Summaries Setup Complete!' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name = 'medical_summaries';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'medical_summaries'; 
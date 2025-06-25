-- =====================================================
-- Medical Records Feature Setup Script
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create the medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('prescription', 'scan', 'lab_result', 'other')),
  hospital_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(type);
CREATE INDEX IF NOT EXISTS idx_medical_records_hospital ON medical_records(hospital_name);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at);

-- 3. Enable Row Level Security
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Users can only see their own records
CREATE POLICY "Users can view their own medical records" ON medical_records
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own records
CREATE POLICY "Users can insert their own medical records" ON medical_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own records
CREATE POLICY "Users can update their own medical records" ON medical_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own records
CREATE POLICY "Users can delete their own medical records" ON medical_records
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to automatically update updated_at
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Create storage bucket for medical files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-files',
  'medical-files',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- 8. Create storage policies for medical files
-- Users can upload files to their own folder
CREATE POLICY "Users can upload their own medical files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own files
CREATE POLICY "Users can view their own medical files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own files
CREATE POLICY "Users can delete their own medical files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 9. Create a function to get user's medical records with file info
CREATE OR REPLACE FUNCTION get_user_medical_records(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  type TEXT,
  hospital_name TEXT,
  visit_date DATE,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id,
    mr.title,
    mr.type,
    mr.hospital_name,
    mr.visit_date,
    mr.file_url,
    mr.file_name,
    mr.file_size,
    mr.file_type,
    mr.notes,
    mr.created_at
  FROM medical_records mr
  WHERE mr.user_id = user_uuid
  ORDER BY mr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON medical_records TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- 11. Create a view for easier querying (optional)
CREATE OR REPLACE VIEW user_medical_records_view AS
SELECT 
  mr.*,
  u.email as user_email
FROM medical_records mr
JOIN auth.users u ON mr.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON user_medical_records_view TO authenticated;

-- =====================================================
-- Setup Complete!
-- =====================================================

-- Test the setup by checking if the table exists
SELECT 
  'Medical Records Setup Complete!' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name = 'medical_records';

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
WHERE tablename = 'medical_records';

-- Check storage bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'medical-files'; 
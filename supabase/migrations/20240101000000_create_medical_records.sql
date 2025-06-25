-- Create medical_records table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(type);
CREATE INDEX IF NOT EXISTS idx_medical_records_hospital ON medical_records(hospital_name);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at);

-- Enable Row Level Security
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own records
CREATE POLICY "Users can view their own medical records" ON medical_records
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own records
CREATE POLICY "Users can insert their own medical records" ON medical_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own records
CREATE POLICY "Users can update their own medical records" ON medical_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own records
CREATE POLICY "Users can delete their own medical records" ON medical_records
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 
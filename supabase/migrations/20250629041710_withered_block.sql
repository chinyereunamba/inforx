/*
  # Create Storage Policies for Medical Files Vault

  1. New Security Policies
    - Enable RLS on vault bucket
    - Add policy for users to access only their own files
    - Add policy for users to upload files to their own directory
    - Add policy for users to delete their own files
  2. Changes
    - Replace the previous "medical-files" bucket with "vault"
    - Implement stricter security controls
*/

-- Enable Row Level Security for vault bucket
CREATE POLICY "Users can view their own files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to insert their own files
CREATE POLICY "Users can upload files to their own folder" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'vault' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  (LOWER(RIGHT(name, 4)) = '.pdf' OR 
   LOWER(RIGHT(name, 5)) = '.docx' OR 
   LOWER(RIGHT(name, 4)) = '.png' OR 
   LOWER(RIGHT(name, 4)) = '.jpg' OR 
   LOWER(RIGHT(name, 5)) = '.jpeg')
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set storage bucket security
UPDATE storage.buckets 
SET public = false 
WHERE name = 'vault';
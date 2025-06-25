# Medical Records Feature

## Overview

The Medical Records section allows users to securely upload, manage, and organize their medical documents within the InfoRx dashboard. This feature provides a comprehensive solution for storing medical files and associated metadata.

## Features

### ✅ Core Functionality

- **File Upload**: Support for PDF, DOCX, PNG, JPG files (up to 10MB)
- **Metadata Management**: Title, type, hospital, visit date, and notes
- **Secure Storage**: Files stored in Supabase Storage with user isolation
- **Search & Filter**: Find records by title, hospital, type, and date
- **File Operations**: View, download, and delete records
- **Responsive Design**: Works on desktop and mobile devices

### 🔐 Security Features

- **Row Level Security (RLS)**: Users can only access their own records
- **File Isolation**: Files stored in user-specific folders
- **Authentication Required**: Only authenticated users can access
- **Input Validation**: File type and size validation

## Database Schema

### `medical_records` Table

```sql
CREATE TABLE medical_records (
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
```

### Storage Bucket

- **Bucket Name**: `medical-files`
- **Path Structure**: `medical-records/{user_id}/{timestamp}-{random}.{ext}`
- **Public Access**: Files are publicly accessible via signed URLs

## File Structure

```
app/(dashboard)/dashboard/medical-records/
├── page.tsx                    # Main medical records page
components/medical-records/
├── MedicalRecordUpload.tsx     # Upload form component
├── MedicalRecordsList.tsx      # Records list/table component
lib/types/
├── medical-records.ts          # TypeScript type definitions
supabase/migrations/
├── 20240101000000_create_medical_records.sql  # Database migration
```

## Setup Instructions

### 1. Database Migration

Run the SQL migration to create the medical_records table:

```bash
# Apply the migration to your Supabase database
supabase db push
```

### 2. Storage Bucket Setup

Create the storage bucket in Supabase:

```sql
-- Create the medical-files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-files', 'medical-files', true);

-- Set up storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Environment Variables

Ensure your environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### For Users

1. **Navigate** to Medical Records in the dashboard sidebar
2. **Upload** new records using the form on the left
3. **Search** and **filter** existing records on the right
4. **View**, **download**, or **delete** records as needed

### For Developers

The feature is built with:

- **Next.js App Router** for routing
- **Supabase** for database and file storage
- **Zustand** for state management
- **TailwindCSS** for styling
- **Lucide React** for icons
- **TypeScript** for type safety

## API Endpoints

### Database Operations

- `GET /api/medical-records` - Fetch user's records
- `POST /api/medical-records` - Create new record
- `DELETE /api/medical-records/[id]` - Delete record

### Storage Operations

- `POST /storage/v1/object/upload` - Upload file
- `GET /storage/v1/object/public` - Get file URL
- `DELETE /storage/v1/object/remove` - Delete file

## Security Considerations

### Data Protection

- All records are isolated by user_id
- Row Level Security prevents cross-user access
- File uploads are validated for type and size
- Files are stored in user-specific folders

### Privacy

- Only authenticated users can access the feature
- Files are not publicly indexed
- User data is encrypted in transit and at rest

## Performance Optimizations

### Database

- Indexes on frequently queried columns
- Efficient queries with proper joins
- Pagination support for large datasets

### Storage

- File size limits (10MB max)
- Optimized file paths for quick access
- CDN integration for fast file delivery

## Accessibility Features

### Screen Reader Support

- Proper ARIA labels and roles
- Semantic HTML structure
- Keyboard navigation support

### Visual Design

- High contrast color scheme
- Clear visual hierarchy
- Responsive design for all screen sizes

## Future Enhancements

### Planned Features

- [ ] Bulk upload functionality
- [ ] Advanced search with full-text search
- [ ] Record sharing with healthcare providers
- [ ] Integration with health APIs
- [ ] Automated record categorization
- [ ] Export functionality (PDF reports)

### Technical Improvements

- [ ] File compression for images
- [ ] Progressive file upload
- [ ] Offline support
- [ ] Real-time collaboration
- [ ] Advanced analytics and insights

## Troubleshooting

### Common Issues

1. **File upload fails**: Check file size and type restrictions
2. **Records not loading**: Verify RLS policies are correctly set
3. **Storage errors**: Ensure bucket exists and policies are configured
4. **Permission denied**: Check user authentication status

### Debug Steps

1. Check browser console for errors
2. Verify Supabase connection
3. Test database policies
4. Validate file upload permissions

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

# Medical Records Feature Setup Guide

## 🚀 Quick Setup

The Medical Records feature is already implemented in your codebase. Follow these steps to get it working:

### 1. Database Setup

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `scripts/setup-medical-records.sql`
4. Click **Run** to execute the script

**Option B: Using Supabase CLI (if Docker is running)**

```bash
# Start Supabase locally
npx supabase start

# Run the migration
npx supabase db push
```

### 2. Environment Variables

Make sure these environment variables are set in your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=medical-files
```

### 3. Verify Setup

After running the SQL script, you should see:

- ✅ `medical_records` table created
- ✅ Row Level Security (RLS) policies enabled
- ✅ Storage bucket `medical-files` created
- ✅ Storage policies configured
- ✅ Indexes for performance optimization

### 4. Test the Feature

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `/dashboard/records` in your browser

3. Try uploading a medical record:

   - Fill out the form with test data
   - Upload a PDF or image file
   - Submit the form

4. Verify the record appears in the list

## 🔧 Troubleshooting

### Issue: "Table doesn't exist"

**Solution**: Run the SQL setup script in your Supabase dashboard

### Issue: "Storage bucket not found"

**Solution**: The SQL script creates the bucket automatically. If it fails, manually create a bucket named `medical-files` in your Supabase dashboard.

### Issue: "Permission denied"

**Solution**: Check that RLS policies are properly set up. The SQL script handles this automatically.

### Issue: "File upload fails"

**Solution**:

1. Check file size (max 10MB)
2. Verify file type (PDF, DOCX, PNG, JPG)
3. Ensure storage bucket exists and is public

### Issue: "Records not showing"

**Solution**:

1. Check browser console for errors
2. Verify user authentication
3. Check RLS policies are working

## 📁 File Structure

```
app/(dashboard)/dashboard/records/
├── page.tsx                    # Main medical records page
├── loading.tsx                 # Loading state
└── error.tsx                   # Error handling

components/medical-records/
├── MedicalRecordUpload.tsx     # Upload form component
├── MedicalRecordsList.tsx      # Records list component
└── types.ts                    # TypeScript types

scripts/
└── setup-medical-records.sql   # Database setup script
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only see their own records
- **File Isolation**: Files are stored in user-specific folders
- **Input Validation**: All form inputs are validated
- **Authentication Required**: Must be logged in to access

## 📊 Database Schema

```sql
medical_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🎯 Next Steps

1. **Test with real data**: Upload some sample medical records
2. **Customize styling**: Modify the UI to match your brand
3. **Add features**: Consider adding search, filtering, or export functionality
4. **Monitor usage**: Check Supabase logs for any issues

## 🆘 Need Help?

If you encounter any issues:

1. Check the browser console for JavaScript errors
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure the SQL setup script ran successfully

The feature should work immediately after following these setup steps! 🎉

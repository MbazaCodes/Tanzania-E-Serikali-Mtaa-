-- Create Documents Storage Buckets
-- This creates storage buckets for uploaded documents like agreements, contracts, business docs, etc.
-- Migration: 20260332_add_documents_storage_bucket.sql

-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Create the business-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-documents',
    'business-documents',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads business" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access business" ON storage.objects;

-- Policy: Allow authenticated users to upload files to documents bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('documents', 'business-documents'));

-- Policy: Allow public read access to all files
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('documents', 'business-documents'));

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('documents', 'business-documents'));

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('documents', 'business-documents'));

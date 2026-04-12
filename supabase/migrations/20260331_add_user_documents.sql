-- Migration: Add user_documents table for storing uploaded documents (IDs, Certificates, Support Documents)
-- Date: 2026-03-31

-- Create user_documents table
CREATE TABLE IF NOT EXISTS user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    document_category TEXT NOT NULL DEFAULT 'support', -- 'id', 'certificate', 'support'
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL, -- Base64 encoded document
    file_type TEXT, -- 'image/jpeg', 'image/png', 'application/pdf'
    file_size INTEGER,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_category ON user_documents(document_category);

-- Enable RLS
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own documents
DROP POLICY IF EXISTS "Users can view their own documents" ON user_documents;
CREATE POLICY "Users can view their own documents" ON user_documents
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own documents
DROP POLICY IF EXISTS "Users can upload their own documents" ON user_documents;
CREATE POLICY "Users can upload their own documents" ON user_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
DROP POLICY IF EXISTS "Users can delete their own documents" ON user_documents;
CREATE POLICY "Users can delete their own documents" ON user_documents
    FOR DELETE USING (auth.uid() = user_id);

-- Staff and admins can view all documents
DROP POLICY IF EXISTS "Staff can view all documents" ON user_documents;
CREATE POLICY "Staff can view all documents" ON user_documents
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Staff and admins can update documents (for verification)
DROP POLICY IF EXISTS "Staff can update documents" ON user_documents;
CREATE POLICY "Staff can update documents" ON user_documents
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Add update trigger
CREATE OR REPLACE FUNCTION update_user_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_documents_updated_at ON user_documents;
CREATE TRIGGER trigger_user_documents_updated_at
    BEFORE UPDATE ON user_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_user_documents_updated_at();

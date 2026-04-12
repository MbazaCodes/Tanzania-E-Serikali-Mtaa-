-- Add payment_data and issued_at columns to applications table
-- payment_data stores transaction details after successful payment

DO $$ 
BEGIN 
    -- Add payment_data column (JSONB to store transaction details)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='payment_data') THEN
        ALTER TABLE applications ADD COLUMN payment_data JSONB;
        COMMENT ON COLUMN applications.payment_data IS 'Stores payment transaction details: transaction_id, amount, payment_method, paid_at';
    END IF;
    
    -- Add issued_at column (timestamp when document was issued)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='issued_at') THEN
        ALTER TABLE applications ADD COLUMN issued_at TIMESTAMPTZ;
        COMMENT ON COLUMN applications.issued_at IS 'Timestamp when the document/certificate was issued after payment';
    END IF;
    
    -- Add approved_by column (staff who approved the application)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='approved_by') THEN
        ALTER TABLE applications ADD COLUMN approved_by UUID REFERENCES users(id);
        COMMENT ON COLUMN applications.approved_by IS 'Staff member who approved the application';
    END IF;
    
    -- Add approved_at column (when application was approved)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='approved_at') THEN
        ALTER TABLE applications ADD COLUMN approved_at TIMESTAMPTZ;
        COMMENT ON COLUMN applications.approved_at IS 'Timestamp when application was approved by staff';
    END IF;
END $$;

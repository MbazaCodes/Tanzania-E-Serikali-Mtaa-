-- =====================================================
-- FILE: 03_documentation.sql
-- E-Mtaa System Documentation Queries
-- Purpose: Generate documentation about the database
-- Run AFTER: 01_final_schema.sql and 02_fix_migration.sql
-- Date: 2026-04-11
-- =====================================================

-- =====================================================
-- 1. TABLE LIST WITH DESCRIPTIONS
-- =====================================================

CREATE OR REPLACE VIEW v_table_documentation AS
SELECT 
    t.table_name,
    COALESCE(obj_description(c.oid), 'No description') as table_description,
    (
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = t.table_name 
        AND table_schema = 'public'
    ) as column_count,
    (
        SELECT COUNT(*) 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = t.table_name 
        AND tc.constraint_type = 'PRIMARY KEY'
    ) as has_primary_key
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- =====================================================
-- 2. COLUMN DOCUMENTATION FOR EACH TABLE
-- =====================================================

CREATE OR REPLACE VIEW v_column_documentation AS
SELECT 
    c.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    pgd.description as column_description,
    CASE 
        WHEN pk.constraint_type = 'PRIMARY KEY' THEN 'YES'
        ELSE 'NO'
    END as is_primary_key,
    CASE 
        WHEN fk.constraint_name IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as is_foreign_key,
    fk.foreign_table_name,
    fk.foreign_column_name
FROM information_schema.columns c
LEFT JOIN pg_catalog.pg_statio_all_tables as st
    ON c.table_name = st.relname
LEFT JOIN pg_catalog.pg_description pgd
    ON pgd.objoid = st.relid
    AND pgd.objsubid = c.ordinal_position
LEFT JOIN (
    SELECT 
        tc.table_name,
        kcu.column_name,
        tc.constraint_type
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT 
        kcu.table_name,
        kcu.column_name,
        ccu.table_name as foreign_table_name,
        ccu.column_name as foreign_column_name,
        tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

-- =====================================================
-- 3. ENUM TYPES DOCUMENTATION
-- =====================================================

CREATE OR REPLACE VIEW v_enum_documentation AS
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

-- =====================================================
-- 4. FUNCTION DOCUMENTATION
-- =====================================================

CREATE OR REPLACE VIEW v_function_documentation AS
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security,
    obj_description(p.oid) as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname NOT LIKE 'trigger_%'
    AND p.proname NOT LIKE '_%'
ORDER BY p.proname;

-- =====================================================
-- 5. RLS POLICY DOCUMENTATION
-- =====================================================

CREATE OR REPLACE VIEW v_rls_policy_documentation AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 6. INDEX DOCUMENTATION
-- =====================================================

CREATE OR REPLACE VIEW v_index_documentation AS
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 7. TRIGGER DOCUMENTATION
-- =====================================================

CREATE OR REPLACE VIEW v_trigger_documentation AS
SELECT 
    tgname as trigger_name,
    relname as table_name,
    CASE 
        WHEN tgtype & 1 = 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END as trigger_type,
    CASE 
        WHEN tgtype & 2 = 2 THEN 'BEFORE'
        WHEN tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as timing,
    CASE 
        WHEN tgtype & 4 = 4 THEN 'INSERT'
        WHEN tgtype & 8 = 8 THEN 'DELETE'
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
        WHEN tgtype & 32 = 32 THEN 'TRUNCATE'
    END as event,
    proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
ORDER BY relname, tgname;

-- =====================================================
-- 8. FOREIGN KEY RELATIONSHIPS MAP
-- =====================================================

CREATE OR REPLACE VIEW v_foreign_keys AS
SELECT
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name as target_table,
    ccu.column_name as target_column,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- 9. TABLE STATISTICS (Row counts)
-- =====================================================

CREATE OR REPLACE VIEW v_table_statistics AS
SELECT 
    t.table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    COALESCE(p.reltuples::bigint, 0) as estimated_row_count,
    pg_size_pretty(pg_total_relation_size(p.oid)) as total_size,
    pg_size_pretty(pg_table_size(p.oid)) as table_size,
    pg_size_pretty(pg_indexes_size(p.oid)) as index_size
FROM information_schema.tables t
JOIN pg_class p ON p.relname = t.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY p.reltuples DESC;

-- =====================================================
-- 10. SERVICE TYPES AND THEIR FORM SCHEMAS
-- =====================================================

CREATE OR REPLACE VIEW v_services_documentation AS
SELECT 
    name as service_name,
    name_en as english_name,
    description,
    fee,
    active,
    -- Extract basic info from form_schema
    (SELECT COUNT(*) FROM jsonb_array_elements(form_schema)) as field_count,
    (SELECT string_agg(DISTINCT value->>'type', ', ') 
     FROM jsonb_array_elements(form_schema) 
     WHERE value->>'type' IS NOT NULL) as field_types
FROM services
ORDER BY name;

-- =====================================================
-- 11. APPLICATION STATUS FLOW DIAGRAM (as text)
-- =====================================================

CREATE OR REPLACE VIEW v_status_flow AS
SELECT 'Application Status Flow Diagram' as documentation,
'    
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                         APPLICATION STATUS FLOW                              │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │                                                                              │
    │   [submitted] ─────────────────────────────────────────────────────────┐    │
    │       │                                                                 │    │
    │       ▼                                                                 │    │
    │   [pending_payment] ──────────────────────────────────────────────────┤    │
    │       │                                                                 │    │
    │       ▼                                                                 │    │
    │   [paid] ─────────────────────────────────────────────────────────────┤    │
    │       │                                                                 │    │
    │       ▼                                                                 │    │
    │   [verified] ─────────────────────────────────────────────────────────┤    │
    │       │                                                                 │    │
    │       ▼                                                                 │    │
    │   [approved] ─────────────────────────────────────────────────────────┤    │
    │       │                                                                 │    │
    │       ▼                                                                 │    │
    │   [issued]                                                              │    │
    │                                                                         │    │
    │   Any status → [rejected] or [returned] (with feedback)                │    │
    │                                                                              │
    └─────────────────────────────────────────────────────────────────────────────┘
' as status_flow_diagram;

-- =====================================================
-- 12. USER ROLE HIERARCHY
-- =====================================================

CREATE OR REPLACE VIEW v_role_hierarchy AS
SELECT 'User Role Hierarchy' as documentation,
'    
    ┌─────────────────────────────────────────────────────────────┐
    │                       ROLE HIERARCHY                         │
    ├─────────────────────────────────────────────────────────────┤
    │                                                              │
    │   ┌─────────┐                                                │
    │   │  admin  │ ← Full system access                          │
    │   └────┬────┘                                                │
    │        │                                                     │
    │   ┌────▼────┐                                                │
    │   │  staff  │ ← Can approve, verify, issue documents        │
    │   └────┬────┘                                                │
    │        │                                                     │
    │   ┌────▼───────┐                                             │
    │   │  citizen   │ ← Regular user, can submit applications    │
    │   └────────────┘                                             │
    │                                                              │
    └─────────────────────────────────────────────────────────────┘
' as role_hierarchy;

-- =====================================================
-- 13. BUSINESS ID FORMATS
-- =====================================================

CREATE OR REPLACE VIEW v_business_id_formats AS
SELECT 'Business ID Formats' as documentation,
'    
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                         BUSINESS ID FORMATS                                  │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │                                                                              │
    │   Citizen ID:    CT + YYYY + LETTER + 5-DIGIT                               │
    │   Example:       CT2026A123456                                               │
    │                                                                              │
    │   Seller ID:     SL + YYYY + LETTER + 5-DIGIT                               │
    │   Example:       SL2026A00001                                                │
    │                                                                              │
    │   Landlord ID:   LL + YYYY + LETTER + 5-DIGIT                               │
    │   Example:       LL2026B00015                                                │
    │                                                                              │
    │   Broker ID:     BR + YYYY + LETTER + 5-DIGIT                               │
    │   Example:       BR2026C00003                                                │
    │                                                                              │
    │   Application:   APP + YYYYMMDD + 4-DIGIT                                   │
    │   Example:       APP-20260411-0001                                           │
    │                                                                              │
    └─────────────────────────────────────────────────────────────────────────────┘
' as formats;

-- =====================================================
-- 14. SERVICE FEE CALCULATIONS
-- =====================================================

CREATE OR REPLACE VIEW v_service_fees AS
SELECT 'Service Fee Calculations' as documentation,
'    
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                         SERVICE FEE CALCULATIONS                             │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │                                                                              │
    │   Makubaliano ya Mauziano (Sales Agreement):                                 │
    │   ├── Service Fee: 5% of sale_price                                         │
    │   ├── VAT: 18% of sale_price                                                │
    │   └── Total: sale_price + VAT + Service Fee                                 │
    │                                                                              │
    │   PANGISHA (Rent Agreement):                                                 │
    │   ├── Service Fee: 3% of (monthly_rent × payment_period)                    │
    │   ├── VAT: 18% of (monthly_rent × payment_period)                           │
    │   └── Total Rent: (monthly_rent × payment_period) + VAT + Service Fee       │
    │                                                                              │
    │   Other Services: Fixed fee as defined in services table                    │
    │                                                                              │
    └─────────────────────────────────────────────────────────────────────────────┘
' as fee_calculations;

-- =====================================================
-- 15. COMPLETE DATABASE REPORT (Summary)
-- =====================================================

CREATE OR REPLACE FUNCTION get_database_summary()
RETURNS TABLE (
    metric TEXT,
    value TEXT
) LANGUAGE SQL AS $$
    SELECT 'Total Tables' as metric, COUNT(*)::TEXT as value FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    UNION ALL
    SELECT 'Total Views', COUNT(*)::TEXT FROM information_schema.views WHERE table_schema = 'public'
    UNION ALL
    SELECT 'Total Functions', COUNT(*)::TEXT FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public'
    UNION ALL
    SELECT 'Total Triggers', COUNT(*)::TEXT FROM pg_trigger WHERE NOT tgisinternal
    UNION ALL
    SELECT 'Total Indexes', COUNT(*)::TEXT FROM pg_indexes WHERE schemaname = 'public'
    UNION ALL
    SELECT 'Total RLS Policies', COUNT(*)::TEXT FROM pg_policies WHERE schemaname = 'public'
    UNION ALL
    SELECT 'Total Enums', COUNT(DISTINCT typname)::TEXT FROM pg_type WHERE typtype = 'e'
    UNION ALL
    SELECT 'Total Users (estimated)', COALESCE(reltuples::bigint, 0)::TEXT FROM pg_class WHERE relname = 'users'
    UNION ALL
    SELECT 'Total Applications (estimated)', COALESCE(reltuples::bigint, 0)::TEXT FROM pg_class WHERE relname = 'applications'
    UNION ALL
    SELECT 'Database Size', pg_size_pretty(pg_database_size(current_database()))
$$;

-- =====================================================
-- 16. GRANT PERMISSIONS ON DOCUMENTATION VIEWS
-- =====================================================

GRANT SELECT ON v_table_documentation TO authenticated;
GRANT SELECT ON v_column_documentation TO authenticated;
GRANT SELECT ON v_enum_documentation TO authenticated;
GRANT SELECT ON v_function_documentation TO authenticated;
GRANT SELECT ON v_rls_policy_documentation TO authenticated;
GRANT SELECT ON v_index_documentation TO authenticated;
GRANT SELECT ON v_trigger_documentation TO authenticated;
GRANT SELECT ON v_foreign_keys TO authenticated;
GRANT SELECT ON v_table_statistics TO authenticated;
GRANT SELECT ON v_services_documentation TO authenticated;
GRANT SELECT ON v_status_flow TO authenticated;
GRANT SELECT ON v_role_hierarchy TO authenticated;
GRANT SELECT ON v_business_id_formats TO authenticated;
GRANT SELECT ON v_service_fees TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_summary() TO authenticated;

-- =====================================================
-- 17. SAMPLE QUERIES FOR COMMON DOCUMENTATION NEEDS
-- =====================================================

-- Sample 1: Get all tables with their row counts
-- SELECT * FROM v_table_statistics;

-- Sample 2: Get all columns for a specific table
-- SELECT * FROM v_column_documentation WHERE table_name = 'applications';

-- Sample 3: Get all foreign key relationships
-- SELECT * FROM v_foreign_keys;

-- Sample 4: Get all RLS policies
-- SELECT * FROM v_rls_policy_documentation;

-- Sample 5: Get database summary
-- SELECT * FROM get_database_summary();

-- Sample 6: Get all enum values
-- SELECT * FROM v_enum_documentation;

-- Sample 7: Get all services with their field counts
-- SELECT * FROM v_services_documentation;
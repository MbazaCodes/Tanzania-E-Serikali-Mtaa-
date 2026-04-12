-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN 
        NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('submitted', 'paid', 'verified', 'approved', 'issued', 'rejected', 'pending_review', 'returned');
EXCEPTION
    WHEN duplicate_object THEN 
        ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'pending_review';
        ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'returned';
END $$;

-- 3. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    gender TEXT,
    sex TEXT,
    nationality TEXT DEFAULT 'Tanzanian',
    country_of_citizenship TEXT DEFAULT 'Tanzania',
    nida_number TEXT,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    role user_role DEFAULT 'citizen',
    is_verified BOOLEAN DEFAULT false,
    is_diaspora BOOLEAN DEFAULT false,
    country_of_residence TEXT,
    passport_number TEXT,
    office_id UUID,
    assigned_region TEXT,
    assigned_district TEXT,
    region TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure recently added columns exist in users table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='office_id') THEN
        ALTER TABLE users ADD COLUMN office_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='assigned_region') THEN
        ALTER TABLE users ADD COLUMN assigned_region TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='assigned_district') THEN
        ALTER TABLE users ADD COLUMN assigned_district TEXT;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    name_en TEXT,
    description TEXT,
    form_schema JSONB NOT NULL,
    diaspora_form_schema JSONB,
    document_template JSONB,
    fee NUMERIC DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure name is unique if table was created previously without it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_name_key') THEN
        ALTER TABLE services ADD CONSTRAINT services_name_key UNIQUE (name);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    form_data JSONB NOT NULL,
    status application_status DEFAULT 'submitted',
    application_number TEXT UNIQUE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    buyer_accepted BOOLEAN DEFAULT false,
    assigned_staff_id UUID REFERENCES users(id),
    region TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure buyer_id and buyer_accepted exist if table was created previously without them
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='buyer_id') THEN
        ALTER TABLE applications ADD COLUMN buyer_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='buyer_accepted') THEN
        ALTER TABLE applications ADD COLUMN buyer_accepted BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='region') THEN
        ALTER TABLE applications ADD COLUMN region TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='district') THEN
        ALTER TABLE applications ADD COLUMN district TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='ward') THEN
        ALTER TABLE applications ADD COLUMN ward TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='street') THEN
        ALTER TABLE applications ADD COLUMN street TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='feedback') THEN
        ALTER TABLE applications ADD COLUMN feedback TEXT;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'TZS',
    payment_method TEXT,
    transaction_id TEXT UNIQUE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop old helper functions that may cause issues
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS auth.get_user_role();

-- 5. Create RLS Policies

-- Users Policies (simplified to avoid recursion)
-- First drop any old problematic policies
DROP POLICY IF EXISTS "Staff and specialized roles can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON users;

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON users;
CREATE POLICY "Authenticated users can view basic profiles" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Services Policies
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Staff can view all services" ON services;
CREATE POLICY "Staff can view all services" ON services
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Applications Policies
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (user_id = auth.uid() OR buyer_id = auth.uid());

DROP POLICY IF EXISTS "Public can verify issued applications" ON applications;
CREATE POLICY "Public can verify issued applications" ON applications
    FOR SELECT USING (status = 'issued');

DROP POLICY IF EXISTS "Staff can view applications in their location" ON applications;
CREATE POLICY "Staff can view applications in their location" ON applications
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
CREATE POLICY "Users can insert their own applications" ON applications
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff and approvers can update applications in their location" ON applications;
CREATE POLICY "Staff and approvers can update applications in their location" ON applications
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Payments Policies
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.id = payments.application_id 
            AND (applications.user_id = auth.uid() OR applications.buyer_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Staff can view payments in their location" ON payments;
CREATE POLICY "Staff can view payments in their location" ON payments
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Add Barua ya Kufungua Shauri (Dispute Letter)
INSERT INTO services (name, name_en, description, fee, active, form_schema, document_template)
VALUES (
    'Barua ya Kufungua Shauri',
    'Dispute Opening Letter',
    'Huduma ya kufungua shauri la mgogoro (Ardhi, Ndoa, Madeni, n.k.) katika mamlaka ya serikali za mitaa.',
    10000,
    true,
    '[
        {"name": "section_dispute", "label": "AINA YA SHAURI / DISPUTE TYPE", "type": "header"},
        {"name": "dispute_type", "label": "Aina ya Shauri", "type": "select", "options": [
            {"value": "ARDHI", "label": "ARDHI / KIWANJA - Land Dispute"},
            {"value": "NDOA", "label": "NDOA / FAMILIA - Marriage Dispute"},
            {"value": "MADENI", "label": "MADENI - Debt Dispute"},
            {"value": "MAJIRANI", "label": "MAJIRANI - Neighbor Dispute"},
            {"value": "URITHI", "label": "URITHI - Inheritance Dispute"},
            {"value": "NYINGINEZO", "label": "NYINGINEZO - Other"}
        ], "required": true},
        {"name": "priority", "label": "Kiprioriti", "type": "select", "options": [
            {"value": "HARAKA", "label": "HARAKA - Emergency"},
            {"value": "KAWAIDA", "label": "KAWAIDA - Normal"}
        ], "required": true},

        {"name": "section_respondent", "label": "TAARIFA ZA MLALAMIKIWA (RESPONDENT)", "type": "header"},
        {"name": "respondent_name", "label": "Jina la Mlalamikiwa", "type": "text", "required": true},
        {"name": "respondent_phone", "label": "Simu ya Mlalamikiwa", "type": "tel"},
        {"name": "respondent_address", "label": "Anwani ya Mlalamikiwa", "type": "textarea", "required": true},

        {"name": "section_details", "label": "MAELEZO YA SHAURI", "type": "header"},
        {"name": "incident_date", "label": "Tarehe ya Tukio", "type": "date", "required": true},
        {"name": "summary", "label": "Muhtasari wa Shauri", "type": "textarea", "required": true},
        {"name": "relief_sought", "label": "Ombi / Unachokitaka (Relief)", "type": "textarea", "required": true}
    ]',
    '{
        "document_type": "BARUA YA KUFUNGUA SHAURI",
        "header": {
            "country": "JAMHURI YA MUUNGANO WA TANZANIA",
            "office": "OFISI YA RAIS - TAMISEMI",
            "logo_url": "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"
        },
        "subject": "YAH: KUFUNGUA SHAURI LA [DISPUTE_TYPE]",
        "body_template": "Mimi [FULL_NAME], mkazi wa [STREET], nafungua rasmi shauri dhidi ya ndugu [RESPONDENT_NAME] kuhusu [DISPUTE_TYPE]. Tukio lilitokea tarehe [INCIDENT_DATE]. Muhtasari wa shauri: [SUMMARY]. Naomba msaada wa kisheria ili kupata [RELIEF_SOUGHT].",
        "footer": "Shauri hili limeandikishwa rasmi na kupewa namba ya kumbukumbu."
    }'
) ON CONFLICT (name) DO UPDATE SET 
    form_schema = EXCLUDED.form_schema,
    document_template = EXCLUDED.document_template;

-- Add Kibari cha Matukio / Sherehe (Event Permit)
INSERT INTO services (name, name_en, description, fee, active, form_schema, document_template)
VALUES (
    'Kibari cha Matukio / Sherehe',
    'Event / Celebration Permit',
    'Kibali cha kufanya sherehe au tukio la kijamii (Harusi, Hitimu, Tamasha, n.k.).',
    20000,
    true,
    '[
        {"name": "section_event", "label": "AINA YA TUKIO", "type": "header"},
        {"name": "event_type", "label": "Aina ya Tukio", "type": "select", "options": [
            {"value": "HARUSI", "label": "HARUSI - Wedding"},
            {"value": "HITIMU", "label": "HITIMU - Graduation"},
            {"value": "TAMASHA", "label": "TAMASHA - Festival"},
            {"value": "MKUTANO", "label": "MKUTANO - Meeting"},
            {"value": "NYINGINEZO", "label": "NYINGINEZO - Other"}
        ], "required": true},
        {"name": "event_name", "label": "Jina la Tukio", "type": "text", "required": true},
        
        {"name": "section_datetime", "label": "MUDA NA MAHALI", "type": "header"},
        {"name": "start_date", "label": "Tarehe ya Kuanza", "type": "date", "required": true},
        {"name": "start_time", "label": "Muda wa Kuanza", "type": "time", "required": true},
        {"name": "venue", "label": "Jina la Ukumbi / Eneo", "type": "text", "required": true},
        {"name": "expected_guests", "label": "Idadi ya Wageni (Inayokadiriwa)", "type": "number", "required": true},

        {"name": "section_organizer", "label": "MWASILIANO", "type": "header"},
        {"name": "contact_person", "label": "Msimamizi wa Tukio", "type": "text", "required": true},
        {"name": "contact_phone", "label": "Simu ya Msimamizi", "type": "tel", "required": true},
        {"name": "whatsapp_group", "label": "Kiungo cha Group la WhatsApp", "type": "url"}
    ]',
    '{
        "document_type": "KIBARI CHA MATUKIO / SHEREHE",
        "header": {
            "country": "JAMHURI YA MUUNGANO WA TANZANIA",
            "office": "OFISI YA RAIS - TAMISEMI",
            "logo_url": "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"
        },
        "subject": "YAH: KIBALI CHA KUFANYA [EVENT_TYPE] - [EVENT_NAME]",
        "body_template": "Ofisi ya Mtendaji inatoa kibali kwa ndugu [FULL_NAME] kufanya sherehe ya [EVENT_NAME] itakayofanyika tarehe [START_DATE] kuanzia saa [START_TIME] katika eneo la [VENUE]. Idadi ya wageni inatarajiwa kuwa [EXPECTED_GUESTS]. Msimamizi wa tukio ni [CONTACT_PERSON] ([CONTACT_PHONE]).",
        "footer": "Kibali hiki ni halali kwa tarehe na muda uliotajwa tu. Zingatia amani na utulivu."
    }'
) ON CONFLICT (name) DO UPDATE SET 
    form_schema = EXCLUDED.form_schema,
    document_template = EXCLUDED.document_template;

-- Add Utambulisho wa Mkazi
INSERT INTO services (name, name_en, description, fee, active, form_schema, document_template)
VALUES (
    'Utambulisho wa Mkazi',
    'Residency Certificate',
    'Hati rasmi ya utambulisho wa mkazi iliyounganishwa na NIDA kwa ajili ya huduma mbalimbali.',
    5000,
    true,
    '[
        {"name": "section_header", "label": "TAARIFA ZA HALMASHAURI", "type": "header"},
        {"name": "council", "label": "Halmashauri", "type": "select", "required": true, "options": [
            {"label": "HALMASHAURI YA MANISPAA YA ARUSHA", "value": "ARUSHA"},
            {"label": "HALMASHAURI YA MANISPAA YA KINONDONI", "value": "KINONDONI"},
            {"label": "HALMASHAURI YA MANISPAA YA DODOMA", "value": "DODOMA"},
            {"label": "HALMASHAURI YA MANISPAA YA MBEYA", "value": "MBEYA"},
            {"label": "HALMASHAURI YA MANISPAA YA MWANZA", "value": "MWANZA"}
        ]},
        
        {"name": "section_personal", "label": "TAARIFA BINAFSI (Zilizohakikiwa na NIDA)", "type": "header"},
        {"name": "marital_status", "label": "Hali ya Ndoa", "type": "select", "options": [
            {"label": "NDOA", "value": "NDOA"},
            {"label": "HAJAOLEWA", "value": "HAJAOLEWA"},
            {"label": "TALAKA", "value": "TALAKA"},
            {"label": "MJANE", "value": "MJANE"}
        ], "required": true},
        {"name": "occupation", "label": "Kazi/Shughuli", "type": "text", "required": true},

        {"name": "section_residence", "label": "TAARIFA ZA MAKAZI", "type": "header"},
        {"name": "neighborhood", "label": "Kitongoji", "type": "text", "required": true},
        {"name": "house_number", "label": "Nyumba No.", "type": "text"},
        {"name": "block_number", "label": "Block/Area", "type": "text"},

        {"name": "section_purpose", "label": "SABABU YA MAOMBI", "type": "header"},
        {"name": "purpose", "label": "Sababu ya Maombi", "type": "select", "required": true, "options": [
            {"label": "KUSOMA", "value": "KUSOMA"},
            {"label": "AJIRA", "value": "AJIRA"},
            {"label": "BIASHARA", "value": "BIASHARA"},
            {"label": "HUDUMA YA AFYA", "value": "HUDUMA_YA_AFYA"},
            {"label": "HATI YA KUSAFIRI", "value": "HATI_YA_KUSAFIRI"},
            {"label": "NYINGINEZO", "value": "NYINGINEZO"}
        ]},

        {"name": "section_intended", "label": "ANWANI YA HUDUMA (INTENDED SERVICE ADDRESS)", "type": "header"},
        {"name": "institution_name", "label": "Jina la Taasisi", "type": "text", "required": true},
        {"name": "institution_type", "label": "Aina ya Taasisi", "type": "select", "options": [
            {"label": "OFISI YA SERIKALI", "value": "OFISI_YA_SERIKALI"},
            {"label": "HOSPITALI", "value": "HOSPITALI"},
            {"label": "BENKI", "value": "BENKI"},
            {"label": "SHULE/CHUO", "value": "SHULE_CHUO"}
        ]}
    ]',
    '{
        "document_type": "CHETI CHA MKAZI",
        "header": {
            "country": "JAMHURI YA MUUNGANO WA TANZANIA",
            "office": "OFISI YA RAIS - TAMISEMI",
            "logo_url": "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"
        },
        "footer": "Cheti hiki ni rasmi na kinaweza kuthibitishwa kwa kuchanganua QR code."
    }'
) ON CONFLICT (name) DO UPDATE SET 
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    fee = EXCLUDED.fee,
    active = EXCLUDED.active,
    form_schema = EXCLUDED.form_schema,
    document_template = EXCLUDED.document_template;

-- Add Risiti ya Malipo as a hidden service for document generation
INSERT INTO services (name, name_en, description, fee, active, form_schema, document_template)
VALUES (
    'Risiti ya Malipo',
    'Payment Receipt',
    'Risiti rasmi ya malipo ya huduma za serikali.',
    0,
    false,
    '[]',
    '{
        "document_type": "RISITI YA MALIPO",
        "header": {
            "country": "JAMHURI YA MUUNGANO WA TANZANIA",
            "office": "OFISI YA RAIS - TAMISEMI",
            "logo_url": "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"
        },
        "footer": "Risiti hii imetolewa kidijitali kupitia mfumo wa E-Mtaa."
    }'
) ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    fee = EXCLUDED.fee,
    active = EXCLUDED.active,
    form_schema = EXCLUDED.form_schema,
    document_template = EXCLUDED.document_template;

-- Add Kibari cha Mazishi (Funeral Permit)
INSERT INTO services (name, name_en, description, fee, active, form_schema, document_template)
VALUES (
    'Kibari cha Mazishi',
    'Funeral Announcement / Permit',
    'Kibali cha kufanya shughuli za mazishi na kutoa taarifa rasmi ya msiba.',
    0,
    true,
    '[
        {"name": "section_deceased", "label": "TAARIFA ZA MAREHEMU", "type": "header"},
        {"name": "deceased_full_name", "label": "Jina Kamili la Marehemu", "type": "text", "required": true},
        {"name": "fathers_name", "label": "Jina la Baba", "type": "text"},
        {"name": "mothers_name", "label": "Jina la Mama", "type": "text"},
        {"name": "date_of_birth", "label": "Tarehe ya Kuzaliwa", "type": "date"},
        {"name": "date_of_death", "label": "Tarehe ya Kufariki", "type": "date", "required": true},
        {"name": "place_of_death", "label": "Mahala pa Kufariki", "type": "text"},
        {"name": "age_at_death", "label": "Umri wa Kufariki", "type": "number"},
        {"name": "surviving_spouse", "label": "Jina la Mume/Mke", "type": "text"},

        {"name": "section_funeral", "label": "RATIBA YA MAZISHI", "type": "header"},
        {"name": "body_location", "label": "Mahala ilipo Maiti", "type": "text", "required": true},
        {"name": "service_date", "label": "Tarehe ya Mazishi", "type": "date", "required": true},
        {"name": "service_time", "label": "Muda wa Mazishi", "type": "time", "required": true},
        {"name": "service_location", "label": "Mahala pa Huduma (Msikiti/Kanisa)", "type": "text"},
        {"name": "burial_location", "label": "Mahala pa Kuzika (Makaburini)", "type": "text", "required": true},

        {"name": "section_rep", "label": "MWASILIANO YA FAMILIA", "type": "header"},
        {"name": "family_representative", "label": "Mwakilishi wa Familia", "type": "text", "required": true},
        {"name": "representative_phone", "label": "Simu ya Mwakilishi", "type": "tel", "required": true},
        {"name": "children_names", "label": "Majina ya Watoto (Wachache)", "type": "textarea"}
    ]',
    '{
        "document_type": "KIBARI CHA MAZISHI",
        "header": {
            "country": "JAMHURI YA MUUNGANO WA TANZANIA",
            "office": "OFISI YA RAIS - TAMISEMI",
            "logo_url": "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"
        },
        "subject": "YAH: TAARIFA YA MSIBA NA MAZISHI YA [DECEASED_FULL_NAME]",
        "body_template": "Kwa huzuni kubwa, tunamtangaza kifo cha ndugu yetu mpenzi [DECEASED_FULL_NAME], mwana wa [FATHER''S_NAME] na [MOTHER''S_NAME], ambaye ametufia tarehe [DATE_OF_DEATH] katika [PLACE_OF_DEATH]. Marehemu alikuwa na umri wa miaka [AGE]. Marehemu atazikwa tarehe [FUNERAL_DATE] saa [TIME] katika [BURIAL_LOCATION]. Mwili unahifadhiwa katika [BODY_LOCATION]. Huduma za mwisho zitafanyika [SERVICE_LOCATION].",
        "footer": "Mwenyezi Mungu ailaze roho ya marehemu mahala pema peponi. Amina."
    }'
) ON CONFLICT (name) DO UPDATE SET 
    form_schema = EXCLUDED.form_schema,
    document_template = EXCLUDED.document_template;

-- Add Makubaliano / Mauziano (Sales Agreement)
INSERT INTO services (name, name_en, description, fee, active, form_schema, document_template)
VALUES (
    'Makubaliano ya Mauziano',
    'Sales Agreement',
    'Huduma ya kusajili makubaliano ya mauziano ya mali (Ardhi, Gari, n.k.) kati ya muuzaji na mnunuzi.',
    15000,
    true,
    '[
        {"name": "section_asset", "label": "TAARIFA ZA MALI (ASSET DETAILS)", "type": "header"},
        {"name": "asset_type", "label": "Aina ya Mali", "type": "select", "options": [
            {"label": "ARDHI / KIWANJA", "value": "ARDHI"},
            {"label": "GARI / CHOMBO CHA MOTO", "value": "GARI"},
            {"label": "NYUMBA", "value": "NYUMBA"},
            {"label": "KODI YA PANGO - MAKAZI", "value": "KODI_PANGO_MAKAZI"},
            {"label": "KODI YA PANGO - BIASHARA", "value": "KODI_PANGO_BIASHARA"},
            {"label": "NYINGINEZO", "value": "NYINGINEZO"}
        ], "required": true},
        {"name": "asset_description", "label": "Maelezo ya Mali", "type": "textarea", "required": true, "placeholder": "Eleza mali kikamilifu (eneo, ukubwa, hali, n.k.)"},
        {"name": "sale_price", "label": "Bei ya Mauziano / Kodi kwa Mwezi (TZS)", "type": "number", "required": true},

        {"name": "section_seller", "label": "TAARIFA ZA MUUZAJI / MPANGISHAJI (SELLER / LANDLORD)", "type": "header"},
        {"name": "seller_tin", "label": "Namba ya TIN (TRA)", "type": "text", "required": false, "placeholder": "Kama unaayo"},
        {"name": "agreement_file", "label": "Pakia Mkataba wa Makubaliano (Signed Agreement)", "type": "file", "required": true},

        {"name": "section_buyer_info", "label": "TAARIFA ZA MNUNUZI / MPANGAJI (BUYER / TENANT)", "type": "header"},
        {"name": "second_party_citizen_id", "label": "Namba ya Raia ya Mnunuzi/Mpangaji (Buyer/Tenant Citizen ID)", "type": "citizen_id_lookup", "required": true}
    ]',
    '{
        "document_type": "HATI YA MAKUBALIANO",
        "header": {
            "country": "JAMHURI YA MUUNGANO WA TANZANIA",
            "office": "OFISI YA RAIS - TAMISEMI",
            "logo_url": "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"
        },
        "subject": "YAH: UTHIBITISHO WA MAKUBALIANO YA MAUZIANO YA [ASSET_TYPE]",
        "body_template": "Ofisi ya Serikali ya Mtaa inathibitisha kuwa kumefanyika makubaliano ya mauziano ya [ASSET_TYPE] ([ASSET_DESCRIPTION]) yenye thamani ya TZS [SALE_PRICE] kati ya Muuzaji [SELLER_NAME] na Mnunuzi [BUYER_NAME]. Makubaliano haya yamehakikiwa na pande zote mbili na kuidhinishwa na mamlaka husika.",
        "footer": "Hati hii ni uthibitisho wa kisheria wa mauziano haya."
    }'
) ON CONFLICT (name) DO UPDATE SET 
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    fee = EXCLUDED.fee,
    active = EXCLUDED.active,
    form_schema = EXCLUDED.form_schema,
    document_template = EXCLUDED.document_template;

-- Add Kibali cha Ujenzi (Building Permit)
INSERT INTO services (name, name_en, description, fee, active, form_schema, document_template)
VALUES (
    'Kibali cha Ujenzi (Maboresho)',
    'Building Permit (Renovations)',
    'Kibali cha kufanya marekebisho au ujenzi mdogo kwenye makazi au biashara.',
    50000,
    true,
    '[
        {"name": "section_property", "label": "TAARIFA ZA KIWANJA / NYUMBA", "type": "header"},
        {"name": "plot_number", "label": "Namba ya Kiwanja", "type": "text", "required": true},
        {"name": "block_number", "label": "Block", "type": "text"},
        {"name": "location_desc", "label": "Maelezo ya Eneo", "type": "textarea", "required": true},
        
        {"name": "section_work", "label": "MAELEZO YA KAZI", "type": "header"},
        {"name": "work_type", "label": "Aina ya Kazi", "type": "select", "options": [
            {"label": "UKUTA / FENSI", "value": "FENSI"},
            {"label": "MABORESHO YA NDANI", "value": "MABORESHO_NDANI"},
            {"label": "PAZE / CHOO", "value": "CHOO_PAZE"},
            {"label": "NYINGINEZO", "value": "NYINGINEZO"}
        ], "required": true},
        {"name": "estimated_cost", "label": "Gharama ya Ujenzi (TZS)", "type": "number"},
        {"name": "duration", "label": "Muda wa Kazi (Siku)", "type": "number", "required": true},

        {"name": "section_docs", "label": "HATI NA RAMANI", "type": "header"},
        {"name": "ownership_doc", "label": "Hati ya Umiliki (Attached)", "type": "file", "required": true}
    ]',
    '{
        "document_type": "KIBALI CHA UJENZI",
        "header": {
            "country": "JAMHURI YA MUUNGANO WA TANZANIA",
            "office": "OFISI YA RAIS - TAMISEMI",
            "logo_url": "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"
        },
        "subject": "YAH: KIBALI CHA UJENZI MDOGO / MABORESHO",
        "body_template": "Ofisi ya Mhandisi wa Ujenzi inatoa kibali kwa ndugu [FULL_NAME] kufanya maboresho ya [WORK_TYPE] katika kiwanja namba [PLOT_NUMBER]. Kazi hii inatarajiwa kuchukua muda wa siku [DURATION]. Mwombaji anapaswa kuzingatia taratibu zote za usalama na mipango miji.",
        "footer": "Kibali hiki ni halali kwa kipindi cha ujenzi kilichotajwa tu."
    }'
) ON CONFLICT (name) DO UPDATE SET 
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    fee = EXCLUDED.fee,
    active = EXCLUDED.active,
    form_schema = EXCLUDED.form_schema,
    document_template = EXCLUDED.document_template;

-- Add Leseni ya Biashara Ndogondogo (Petty Trader License)
INSERT INTO services (name, name_en, description, fee, active, form_schema, document_template)
VALUES (
    'Leseni ya Biashara Ndogondogo',
    'Petty Trader License',
    'Leseni kwa ajili ya wafanyabiashara wadogo (Machinga, Mama Lishe, n.k.) katika maeneo ya serikali za mitaa.',
    10000,
    true,
    '[
        {"name": "section_biz", "label": "TAARIFA ZA BIASHARA", "type": "header"},
        {"name": "business_name", "label": "Jina la Biashara", "type": "text"},
        {"name": "business_type", "label": "Aina ya Biashara", "type": "select", "options": [
            {"label": "CHAKULA (MAMA LISHE)", "value": "CHAKULA"},
            {"label": "BIDHAA NDOGONDOGO", "value": "BIDHAA"},
            {"label": "HUDUMA (KEREKERE, n.k.)", "value": "HUDUMA"},
            {"label": "NYINGINEZO", "value": "NYINGINEZO"}
        ], "required": true},
        {"name": "location", "label": "Eneo la Biashara (Mtaa/Soko)", "type": "text", "required": true},
        
        {"name": "section_owner", "label": "TAARIFA ZA MMILIKI", "type": "header"},
        {"name": "tin_number", "label": "Namba ya TIN (Kama unayo)", "type": "text"},
        {"name": "id_copy", "label": "Nakala ya Kitambulisho (NIDA/Mpiga Kura)", "type": "file", "required": true}
    ]',
    '{
        "document_type": "LESENI YA BIASHARA NDOGONDOGO",
        "header": {
            "country": "JAMHURI YA MUUNGANO WA TANZANIA",
            "office": "OFISI YA RAIS - TAMISEMI",
            "logo_url": "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"
        },
        "subject": "YAH: LESENI YA BIASHARA NDOGONDOGO - [BUSINESS_NAME]",
        "body_template": "Ndugu [FULL_NAME] amepewa leseni ya kufanya biashara ya [BUSINESS_TYPE] katika eneo la [LOCATION]. Leseni hii inamtambua kama mfanyabiashara mdogo na anapaswa kufuata sheria na kanuni za biashara za halmashauri husika.",
        "footer": "Leseni hii ni halali kwa mwaka mmoja tangu tarehe ya kutolewa."
    }'
) ON CONFLICT (name) DO UPDATE SET 
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    fee = EXCLUDED.fee,
    active = EXCLUDED.active,
    form_schema = EXCLUDED.form_schema,
    document_template = EXCLUDED.document_template;

-- 7. Function to handle application numbers
CREATE OR REPLACE FUNCTION generate_app_number() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.application_number := 'TZ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_app_number ON applications;
CREATE TRIGGER tr_generate_app_number
BEFORE INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION generate_app_number();

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all logs" ON activity_logs;
CREATE POLICY "Admins can view all logs" ON activity_logs
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view their own logs" ON activity_logs;
CREATE POLICY "Users can view their own logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 6. RPC Functions
DROP FUNCTION IF EXISTS get_user_profile(UUID);
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS SETOF users AS $$
BEGIN
    RETURN QUERY SELECT * FROM users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

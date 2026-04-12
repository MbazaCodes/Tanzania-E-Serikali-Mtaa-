-- Update Makubaliano ya Mauziano service to use citizen_id_lookup
-- This allows landlords/sellers to lookup tenants/buyers by their Citizen ID
-- The second party will receive a notification to approve the agreement

UPDATE public.services 
SET form_schema = '[
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
]'::jsonb
WHERE name = 'Makubaliano ya Mauziano';

-- Add comment
COMMENT ON COLUMN public.services.form_schema IS 'JSON array defining form fields. citizen_id_lookup type enables second party lookup for agreements.';

// Seed data for E-Mtaa Services

INSERT INTO public.services (name, description, fee, form_schema, document_template)
VALUES 
(
    'Cheti cha Mkazi', 
    'Hiki ni cheti kinachothibitisha ukaazi wa raia katika mtaa au kijiji fulani.', 
    5000.00,
    '[
        {"name": "full_name", "label": "Jina Kamili", "type": "text", "required": true},
        {"name": "council", "label": "Halmashauri", "type": "select", "required": true, "options": [{"label": "Ilala MC", "value": "ilala_mc"}, {"label": "Kinondoni MC", "value": "kinondoni_mc"}]},
        {"name": "ward", "label": "Kata", "type": "text", "required": true},
        {"name": "street", "label": "Mtaa/Kijiji", "type": "text", "required": true},
        {"name": "house_number", "label": "Namba ya Nyumba", "type": "text", "required": true},
        {"name": "duration_of_stay", "label": "Muda wa Kuishi (Miaka)", "type": "number", "required": true},
        {"name": "purpose", "label": "Sababu ya Maombi", "type": "textarea", "required": true}
    ]'::jsonb,
    '{"border_style": "double", "background_color": "#FDF5E6", "font_family": "Inter"}'::jsonb
),
(
    'Kibali cha Mazisho', 
    'Kibali kinachotolewa kuruhusu mazishi kufanyika katika eneo husika.', 
    2000.00,
    '[
        {"name": "deceased_name", "label": "Jina la Marehemu", "type": "text", "required": true},
        {"name": "date_of_death", "label": "Tarehe ya Kufariki", "type": "date", "required": true},
        {"name": "cause_of_death", "label": "Sababu ya Kifo", "type": "text", "required": true},
        {"name": "burial_place", "label": "Eneo la Maziko", "type": "text", "required": true},
        {"name": "informant_name", "label": "Jina la Mtoa Taarifa", "type": "text", "required": true}
    ]'::jsonb,
    '{"border_style": "solid", "background_color": "#FFFFFF", "font_family": "Inter"}'::jsonb
),
(
    'Kibali cha Sherehe', 
    'Kibali cha kufanya sherehe au mkusanyiko wa kijamii.', 
    10000.00,
    '[
        {"name": "event_type", "label": "Aina ya Sherehe", "type": "select", "required": true, "options": [{"label": "Harusi", "value": "wedding"}, {"label": "Kipaimara", "value": "confirmation"}]},
        {"name": "event_date", "label": "Tarehe ya Sherehe", "type": "date", "required": true},
        {"name": "venue", "label": "Eneo la Sherehe", "type": "text", "required": true},
        {"name": "expected_guests", "label": "Idadi ya Wageni", "type": "number", "required": true},
        {"name": "start_time", "label": "Muda wa Kuanza", "type": "text", "required": true},
        {"name": "end_time", "label": "Muda wa Kuisha", "type": "text", "required": true}
    ]'::jsonb,
    '{"border_style": "ornamental", "background_color": "#FDF5E6", "font_family": "Inter"}'::jsonb
);

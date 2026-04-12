-- Migration: Backfill service_fee for existing Mauziano and PANGISHA applications
-- This updates applications where service_fee was not calculated at submission time

-- Update Mauziano (Sales Agreement) applications - 5% of sale_price
UPDATE applications
SET form_data = jsonb_set(
  form_data,
  '{service_fee}',
  to_jsonb(ROUND((form_data->>'sale_price')::numeric * 0.05))
)
WHERE service_id = '5'  -- Mauziano service
  AND form_data->>'sale_price' IS NOT NULL
  AND (form_data->>'service_fee' IS NULL OR (form_data->>'service_fee')::numeric = 0);

-- Update PANGISHA (Rent Agreement) applications - 3% of (monthly_rent * payment_period)
UPDATE applications
SET form_data = jsonb_set(
  form_data,
  '{service_fee}',
  to_jsonb(ROUND(
    (form_data->>'monthly_rent')::numeric * 
    (form_data->>'payment_period')::numeric * 
    0.03
  ))
)
WHERE service_id = '6'  -- PANGISHA service
  AND form_data->>'monthly_rent' IS NOT NULL
  AND form_data->>'payment_period' IS NOT NULL
  AND (form_data->>'service_fee' IS NULL OR (form_data->>'service_fee')::numeric = 0);

-- Also update vat_amount and total for Mauziano if missing
UPDATE applications
SET form_data = jsonb_set(
  jsonb_set(
    form_data,
    '{vat_amount}',
    to_jsonb(ROUND((form_data->>'sale_price')::numeric * 0.18))
  ),
  '{total_amount}',
  to_jsonb(
    (form_data->>'sale_price')::numeric + 
    ROUND((form_data->>'sale_price')::numeric * 0.18) + 
    ROUND((form_data->>'sale_price')::numeric * 0.05)
  )
)
WHERE service_id = '5'
  AND form_data->>'sale_price' IS NOT NULL
  AND (form_data->>'total_amount' IS NULL OR (form_data->>'total_amount')::numeric = 0);

-- Also update vat_amount and total_rent for PANGISHA if missing
UPDATE applications
SET form_data = jsonb_set(
  jsonb_set(
    form_data,
    '{vat_amount}',
    to_jsonb(ROUND(
      (form_data->>'monthly_rent')::numeric * 
      (form_data->>'payment_period')::numeric * 
      0.18
    ))
  ),
  '{total_rent}',
  to_jsonb(
    (form_data->>'monthly_rent')::numeric * (form_data->>'payment_period')::numeric +
    ROUND((form_data->>'monthly_rent')::numeric * (form_data->>'payment_period')::numeric * 0.18) +
    ROUND((form_data->>'monthly_rent')::numeric * (form_data->>'payment_period')::numeric * 0.03)
  )
)
WHERE service_id = '6'
  AND form_data->>'monthly_rent' IS NOT NULL
  AND form_data->>'payment_period' IS NOT NULL
  AND (form_data->>'total_rent' IS NULL OR (form_data->>'total_rent')::numeric = 0);

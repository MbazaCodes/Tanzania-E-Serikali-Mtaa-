// Supabase Edge Function: nida-verification
// Deploy to Supabase using: supabase functions deploy nida-verification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nida_number, user_id } = await req.json()

    // 1. Call NIDA API (Mocked for this example)
    // In production, use fetch() to call the real NIDA API
    const nidaResponse = {
      status: 'success',
      data: {
        first_name: 'JUMA',
        middle_name: 'HAMISI',
        last_name: 'BAKARI',
        gender: 'MALE',
        dob: '1990-05-15',
        nationality: 'Tanzanian'
      }
    }

    // 2. Update user record in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase
      .from('users')
      .update({
        first_name: nidaResponse.data.first_name,
        middle_name: nidaResponse.data.middle_name,
        last_name: nidaResponse.data.last_name,
        gender: nidaResponse.data.gender,
        is_verified: true,
        nida_number: nida_number
      })
      .eq('id', user_id)

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'NIDA Verification Successful', data: nidaResponse.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

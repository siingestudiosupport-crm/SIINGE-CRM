import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const filePath = url.searchParams.get('filePath')
    const filename = url.searchParams.get('filename') || 'document.pdf'
    const token = url.searchParams.get('token')

    if (!filePath) {
      return new Response(JSON.stringify({ error: 'Missing filePath parameter' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing access token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate token exists and is not used
    const { data: tokenData, error: tokenError } = await supabase
      .from('portal_access_tokens')
      .select('*')
      .eq('token', token)
      .is('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Mark token as used after download starts
    await supabase
      .from('portal_access_tokens')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('token', token)

    // Download from storage
    const { data, error } = await supabase.storage
      .from('contracts')
      .download(filePath)

    if (error || !data) {
      return new Response(JSON.stringify({ error: error?.message || 'File not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer()

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

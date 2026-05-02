// @ts-nocheck — Deno Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Verify webhook signature
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')
    if (webhookSecret) {
      const signature = req.headers.get('x-webhook-signature')
      if (!signature || signature !== webhookSecret) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    const payload = await req.json()

    // Only handle email.opened events
    if (payload.type !== 'email.opened') {
      return new Response('ignored', { status: 200 })
    }

    const tags: { name: string; value: string }[] = payload.data?.tags || []
    const queueItemId = tags.find(t => t.name === 'queue_item_id')?.value

    if (!queueItemId || queueItemId === 'none') {
      return new Response('no queue_item_id', { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Only set opened_at the first time
    const { data: item } = await supabase
      .from('email_queue')
      .select('opened_at')
      .eq('id', queueItemId)
      .single()

    if (item && !item.opened_at) {
      await supabase
        .from('email_queue')
        .update({ opened_at: new Date().toISOString() })
        .eq('id', queueItemId)

      console.log(`Marked opened: queue item ${queueItemId}`)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err.message)
    return new Response(err.message, { status: 500 })
  }
})

// @ts-nocheck — Deno Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { resend_id } = await req.json()
    if (!resend_id) return new Response('Missing resend_id', { status: 400 })

    const res = await fetch(`https://api.resend.com/emails/${resend_id}`, {
      method:  'DELETE',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
    })

    // 200 = cancelled, 422 = already sent (not an error for us)
    const ok = res.status === 200 || res.status === 422
    return new Response(JSON.stringify({ ok }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(err.message, { status: 500 })
  }
})

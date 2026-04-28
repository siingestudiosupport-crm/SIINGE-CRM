// @ts-nocheck — Deno Edge Function: disable TS server checks (URL imports, Deno global)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()

    if (payload.event === 'invitee.created') {
      const invitee = payload.payload

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const qa = invitee.questions_and_answers || [];

      const getAnswer = (keywords) => {
        const found = qa.find((q) =>
          keywords.some(kw => q.question.toLowerCase().includes(kw.toLowerCase()))
        );
        const answer = found?.answer?.trim();
        return answer || null;
      };

      const company = getAnswer(['company', 'empresa', 'brand name']);
      const brand_stage = getAnswer(['stage of growth']);
      const investment_level = getAnswer(['level of investment']);
      const development_timeline = getAnswer(['begin development']);
      const support_level = getAnswer(['level of support']);
      const primary_issue = getAnswer(['primary issue']);

      // Extraemos la fecha y el link de la reunión
      const start_time = invitee.scheduled_event?.start_time || null;
      let meeting_link = null;
      if (invitee.scheduled_event?.location) {
        const loc = invitee.scheduled_event.location;
        meeting_link = loc.join_url || (loc.location && loc.location.startsWith('http') ? loc.location : null);
      }

      // Intento 1: El campo oficial de recordatorios SMS de Calendly
      let phone_number = invitee.text_reminder_number || null;

      // Intento 2: Buscar agresivamente en las preguntas personalizadas
      if (!phone_number) {
        phone_number = getAnswer(['phone', 'teléfono', 'whatsapp', 'number', 'número', 'sms']);
      }

      // Detectar país por prefijo telefónico
      let country = null;
      if (phone_number) {
        const cleanPhone = phone_number.replace(/\s+/g, '');
        if (cleanPhone.startsWith('+1')) country = 'USA/Canada 🇺🇸🇨🇦';
        else if (cleanPhone.startsWith('+57')) country = 'Colombia 🇨🇴';
        else if (cleanPhone.startsWith('+52')) country = 'Mexico 🇲🇽';
        else if (cleanPhone.startsWith('+34')) country = 'Spain 🇪🇸';
        else if (cleanPhone.startsWith('+44')) country = 'UK 🇬🇧';
        else if (cleanPhone.startsWith('+54')) country = 'Argentina 🇦🇷';
        else if (cleanPhone.startsWith('+56')) country = 'Chile 🇨🇱';
        else if (cleanPhone.startsWith('+51')) country = 'Peru 🇵🇪';
        else if (cleanPhone.startsWith('+58')) country = 'Venezuela 🇻🇪';
        else if (cleanPhone.startsWith('+55')) country = 'Brazil 🇧🇷';
        else if (cleanPhone.startsWith('+49')) country = 'Germany 🇩🇪';
        else if (cleanPhone.startsWith('+33')) country = 'France 🇫🇷';
        else if (cleanPhone.startsWith('+39')) country = 'Italy 🇮🇹';
        else if (cleanPhone.startsWith('+61')) country = 'Australia 🇦🇺';
        else if (cleanPhone.startsWith('+')) country = 'International 🌍';
      }

      console.log(`Procesando a ${invitee.name} del país ${country || 'Desconocido'} con teléfono ${phone_number || 'N/A'}...`);

      // Verificar si el cliente ya existe para no sobreescribir estado de contratos
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', invitee.email)
        .maybeSingle()

      const clientPayload = {
        name: invitee.name,
        email: invitee.email,
        company,
        brand_stage,
        investment_level,
        development_timeline,
        support_level,
        primary_issue,
        scheduled_date: start_time,
        meeting_link,
        phone_number,
        country,
        lead_source: 'Calendly',
      }

      // Solo setear estado de contratos en clientes nuevos
      if (!existing) {
        clientPayload.nda_status = 'Pending'
        clientPayload.sow_status = 'Pending'
      }

      const { error } = await supabase
        .from('clients')
        .upsert(clientPayload, { onConflict: 'email' })
        .select()

      if (error) {
        console.error("❌ ERROR EXACTO DE SUPABASE:", error);
        throw error;
      }

      return new Response("Cliente guardado", { status: 200 })
    }

    return new Response("Evento ignorado", { status: 200 })

  } catch (error) {
    console.error("❌ ERROR CATCH:", error.message);
    return new Response(error.message, { status: 400 })
  }
})

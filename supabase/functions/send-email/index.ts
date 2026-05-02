import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AQUÍ ESTÁ TU FIRMA HTML EXACTA (MANTENIDA ÍNTEGRA)
const HTML_SIGNATURE = `
<div dir="ltr" id="isPasted">
    <table style="direction:ltr;border-collapse:collapse;">
        <tbody valign="middle">
            <tr valign="inherit">
                <td style="font-size:0;height:12px;line-height:0;" height="12" valign="inherit">
                    <br>
                </td>
            </tr>
            <tr valign="inherit">
                <td valign="inherit">
                    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;" width="100%">
                        <tbody valign="middle">
                            <tr valign="inherit">
                                <td valign="inherit">
                                    <table cellpadding="0" cellspacing="0" width="100%" style="width:100%;line-height:normal;">
                                        <tbody valign="middle">
                                            <tr valign="inherit">
                                                <td style="font-family:Arial;text-align:left;" align="left" valign="inherit">
                                                    <p style="margin:1px;"><img style="height: 57px;" src="https://permanent-assets-download.flockmail.com/signature/2408373/2024-06-03_97715a5fe6096b15c04b_8910" alt="Kind regards," height="57"></p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr valign="inherit">
                                <td style="line-height:1%;padding-top:16px;font-size:1px;" valign="inherit">
                                    <br>
                                </td>
                            </tr>
                            <tr valign="inherit">
                                <td valign="inherit">
                                    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;line-height:1.15;">
                                        <tbody valign="middle">
                                            <tr valign="inherit">
                                                <td style="vertical-align:middle;padding:.01px 12px 0.01px 1px;width:92px;text-align:center;" valign="middle" align="center"><img border="0" src="https://permanent-assets-download.flockmail.com/signature/2408373/2024-06-03_36c3cd811224bc3a55b5_55761" height="84" width="92" alt="photo" style="width: 92px; vertical-align: middle; border-radius: 0px; height: 84px; border: 0px; display: block;"></td>
                                                <td valign="top" style="padding:.01px 0.01px 0.01px 12px;vertical-align:top;border-left:solid 1px #BDBDBD;">
                                                    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                                        <tbody valign="middle">
                                                            <tr valign="inherit">
                                                                <td style="padding:.01px;" valign="inherit">
                                                                    <p style="margin:.1px;line-height:108.0%;font-size:16px;"><span style="font-family:Georgia;font-size:16px;font-weight:bold;color:#646464;letter-spacing:0;white-space:nowrap;">Sierra White</span>
                                                                        <br><span style="font-family:Arial;font-size:13px;font-weight:bold;color:#646464;white-space:nowrap;">Founder / CEO,&nbsp;</span><span style="font-family:Arial;font-size:13px;font-weight:bold;color:#646464;white-space:nowrap;">SIINGE STUDIO</span></p>
                                                                </td>
                                                            </tr>
                                                            <tr valign="inherit">
                                                                <td valign="inherit">
                                                                    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                                                        <tbody valign="middle">
                                                                            <tr valign="inherit">
                                                                                <td style="padding-top:12px;white-space:nowrap;width:246px;font-family:Arial;" valign="inherit">
                                                                                    <p style="margin:1px;line-height:99%;font-size:11px;"><span style="white-space:nowrap;"><a href="tel:1(720)819-5840" target="_blank" style="font-family:Arial;text-decoration:unset;" rel="nofollow noreferrer"><span style="line-height:120%;font-family:Arial;font-size:11px;color-scheme:only;color:#212121;white-space:nowrap;">1(720)819-5840</span></a>&nbsp; | &nbsp;<a href="https://www.siinge.studio/" target="_blank" style="font-family:Arial;text-decoration:unset;" rel="nofollow noreferrer"><span style="line-height:120%;font-family:Arial;font-size:11px;color-scheme:only;color:#212121;white-space:nowrap;">www.siinge.studio/</span></a></span></p>
                                                                                </td>
                                                                            </tr>
                                                                            <tr valign="inherit">
                                                                                <td style="padding-top:6px;white-space:nowrap;width:138px;font-family:Arial;" valign="inherit">
                                                                                    <p style="margin:1px;line-height:99%;font-size:11px;"><span style="white-space:nowrap;"><a href="mailto:sierra@siinge.studio" target="_blank" style="font-family:Arial;text-decoration:unset;" rel="nofollow noreferrer"><span style="line-height:120%;font-family:Arial;font-size:11px;color-scheme:only;color:#212121;white-space:nowrap;">sierra@siinge.studio</span></a></span></p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr valign="inherit">
                                <td style="line-height:1%;padding-top:16px;font-size:1px;" valign="inherit">
                                    <br>
                                </td>
                            </tr>
                            <tr valign="inherit">
                                <td valign="inherit">
                                    <table cellpadding="0" cellspacing="0" width="100%" style="width:100%;color:gray;border-top:1px solid gray;line-height:normal;">
                                        <tbody valign="middle">
                                            <tr valign="inherit">
                                                <td style="padding:9px 8px 0 0;" valign="inherit">
                                                    <p style="color:#888888;text-align:left;font-size:10px;margin:1px;line-height:120%;font-family:Arial ;">IMPORTANT: The contents of this email and any attachments are confidential. They are intended for the named recipient(s) only. If you have received this email by mistake, please notify the sender immediately and do not disclose the contents to anyone or make copies thereof.</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr valign="inherit">
                                <td style="line-height:1%;padding-top:16px;font-size:1px;" valign="inherit">
                                    <br>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr valign="inherit">
                <td style="font-family:'ws-id VGqaqp2eORne';font-size:.01px;line-height:0;" valign="inherit">&nbsp;</td>
            </tr>
        </tbody>
    </table>
</div>
`;

serve(async (req: Request) => {
  // Manejo de pre-vuelo para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = Deno.env.get('SEND_EMAIL_SECRET')
    if (webhookSecret) {
      const signature = req.headers.get('x-webhook-signature')
      if (!signature || signature !== webhookSecret) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Recibimos client_id y doc_type desde el Frontend para el tracking
    const { to, subject, html, client_id, doc_type, queue_item_id, attachments } = await req.json()

    // Unimos el mensaje original del CRM con la firma HTML
    const finalHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333;">
        ${html}
      </div>
      <br><br>
      ${HTML_SIGNATURE}
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Sierra | SIINGE STUDIO <sierra@siinge.studio>',
        to: [to],
        // Follow-ups are covered by the daily digest — skip CC to avoid flooding
        ...(doc_type !== 'followup' ? { cc: ['sierra@siinge.studio'] } : {}),
        subject: subject,
        html: finalHtml,
        // Include attachments if provided
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
        // ETIQUETAS PARA QUE EL WEBHOOK SEPA QUÉ DOCUMENTO SE ABRIÓ
        tags: [
          { name: 'client_id',     value: client_id     || 'unknown' },
          { name: 'doc_type',      value: doc_type      || 'general' },
          { name: 'queue_item_id', value: queue_item_id || 'none'    }
        ]
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', data, 'Attachments sent:', !!attachments)
      return new Response(JSON.stringify({ error: data?.message || data?.name || 'Resend rejected the request', resend: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: res.status,
      })
    }

    console.log('Email sent successfully with attachments:', !!attachments)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
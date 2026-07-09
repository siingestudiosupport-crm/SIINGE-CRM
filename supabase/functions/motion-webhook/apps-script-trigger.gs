// Google Apps Script — reemplaza el trigger de Zapier "Email by Zapier".
// Se corre desde script.google.com atado a siingestudiodev@gmail.com, NO desde este repo.
// Instalación: script.google.com > Proyecto nuevo > pegar esto > Triggers (reloj, izq)
//   > Add trigger > processMotionBookings > Time-driven > every 5 minutes.

const WEBHOOK_URL = 'https://pbylrmaqtmgnywzdliql.supabase.co/functions/v1/motion-webhook'
const WEBHOOK_SECRET = 'PASTE_MOTION_BOOKING_SECRET_HERE' // mismo valor que MOTION_BOOKING_SECRET en Supabase
const SEARCH_QUERY = 'is:unread subject:"Scale Your Fashion Brand"'

function processMotionBookings() {
  const threads = GmailApp.search(SEARCH_QUERY, 0, 20)
  threads.forEach(thread => {
    thread.getMessages().forEach(msg => {
      if (!msg.isUnread()) return
      const payload = { secret: WEBHOOK_SECRET, subject: msg.getSubject(), body: msg.getPlainBody() }
      const res = UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      })
      if (res.getResponseCode() === 200) {
        msg.markRead() // ponytail: solo se marca leído si el webhook confirmó, así un fallo se reintenta en la próxima corrida
      } else {
        Logger.log(`Webhook failed (${res.getResponseCode()}): ${res.getContentText()}`)
      }
    })
  })
}

// Corre esto manualmente desde el editor para ver qué se enviaría, sin marcar nada como leído.
function dryRun() {
  const threads = GmailApp.search(SEARCH_QUERY, 0, 20)
  threads.forEach(thread => thread.getMessages().forEach(msg => {
    if (msg.isUnread()) Logger.log(JSON.stringify({ subject: msg.getSubject(), body: msg.getPlainBody().slice(0, 300) }))
  }))
}

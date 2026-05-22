/** Placeholder sostituito per ogni iscritto al momento dell'invio */
export const UNSUB_PLACEHOLDER = "{{UNSUBSCRIBE_URL}}"

/**
 * Costruisce l'HTML completo di una newsletter branded GeF Crochet.
 * htmlBody: testo/paragrafi già generati (plain text con \n oppure HTML semplice)
 * subject: oggetto dell'email (usato come titolo visivo)
 * unsubscribeUrl: URL personalizzato per il link di disiscrizione
 */
export function buildNewsletterHtml({
  subject,
  htmlBody,
  unsubscribeUrl,
}: {
  subject: string
  htmlBody: string
  unsubscribeUrl: string
}): string {
  const bodyHtml = htmlBody
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#1a1a1a;">${para.replace(/\n/g, "<br/>")}</p>`)
    .join("")

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4ee;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#516447;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#ffffff;letter-spacing:3px;">GeF Crochet</p>
              <p style="margin:6px 0 0;font-size:12px;color:#b8cdaa;letter-spacing:1px;text-transform:uppercase;">prodotti artigianali all'uncinetto</p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px 24px;">
              <h2 style="margin:0 0 24px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#191c19;line-height:1.3;">${subject}</h2>
              ${bodyHtml}
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td>
                    <a href="https://gefcrochet.it/shop" style="display:inline-block;background:#516447;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:24px;text-decoration:none;">
                      Scopri il negozio →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#516447;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#b8cdaa;">© ${new Date().getFullYear()} GeF Crochet — Fatto con ❤ in Italia</p>
              <p style="margin:0;font-size:11px;color:#8fa382;">
                Hai ricevuto questa email perché sei iscritto alla nostra newsletter.<br/>
                <a href="${unsubscribeUrl}" style="color:#b8cdaa;text-decoration:underline;">Disiscrivi</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Versione con placeholder non ancora sostituito (salvata in DB) */
export function buildNewsletterHtmlTemplate({
  subject,
  htmlBody,
}: {
  subject: string
  htmlBody: string
}): string {
  return buildNewsletterHtml({ subject, htmlBody, unsubscribeUrl: UNSUB_PLACEHOLDER })
}

/** Personalizza l'HTML salvato in DB sostituendo il placeholder con l'URL reale */
export function personalizeHtml(html: string, unsubscribeUrl: string): string {
  return html.replaceAll(UNSUB_PLACEHOLDER, unsubscribeUrl)
}

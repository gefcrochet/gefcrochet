/** Placeholder sostituito per ogni iscritto al momento dell'invio */
export const UNSUB_PLACEHOLDER = "{{UNSUBSCRIBE_URL}}"

const SITE_URL = "https://gefcrochet.it"
const LOGO_URL = `${SITE_URL}/logo.png`

export interface NewsletterProduct {
  name: string
  description: string
  imageUrl?: string | null
  price?: number | null
  salePrice?: number | null
}

export interface NewsletterTemplateData {
  subject: string
  /** Titolo visivo grande nell'hero verde */
  headline: string
  /** Frase di apertura in corsivo sotto l'hero */
  intro: string
  /** Corpo principale (testo con \n\n tra paragrafi) */
  body: string
  /** Frase/firma finale — resa come pull-quote */
  closing: string
  products?: NewsletterProduct[]
  unsubscribeUrl: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function absUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`
}

function formatEur(cents?: number | null): string {
  if (cents == null) return ""
  return (cents / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" })
}

function textToParagraphs(text: string): string {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#2d302d;">${p.replace(/\n/g, "<br/>")}</p>`
    )
    .join("")
}

function productCard(p: NewsletterProduct): string {
  const img = absUrl(p.imageUrl)
  const shortDesc =
    p.description.length > 130 ? p.description.slice(0, 127) + "…" : p.description
  const priceHtml = p.salePrice
    ? `<span style="text-decoration:line-through;color:#9a9e99;margin-right:8px;font-size:13px;">${formatEur(p.price)}</span><span style="color:#516447;font-weight:700;font-size:15px;">${formatEur(p.salePrice)}</span>`
    : p.price
    ? `<span style="color:#516447;font-weight:600;font-size:15px;">${formatEur(p.price)}</span>`
    : ""

  return `
  <tr>
    <td style="padding:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #e4e7da;border-radius:10px;overflow:hidden;background:#ffffff;">
        ${
          img
            ? `<tr>
                 <td style="padding:0;line-height:0;">
                   <img src="${img}" alt="${p.name}" width="100%"
                        style="display:block;width:100%;max-height:300px;border-radius:10px 10px 0 0;object-fit:cover;" />
                 </td>
               </tr>`
            : ""
        }
        <tr>
          <td style="padding:22px 26px 26px;">
            <h3 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;
                       font-size:19px;font-weight:400;color:#191c19;line-height:1.3;">
              ${p.name}
            </h3>
            ${priceHtml ? `<p style="margin:0 0 12px;">${priceHtml}</p>` : ""}
            <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#555751;">${shortDesc}</p>
            <a href="${SITE_URL}/shop"
               style="display:inline-block;background:#516447;color:#ffffff;
                      font-size:13px;font-weight:600;padding:9px 24px;
                      border-radius:22px;text-decoration:none;letter-spacing:0.2px;">
              Scopri →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// ── Template principale ────────────────────────────────────────────────────

/**
 * Costruisce l'HTML completo della newsletter con layout ricco:
 * logo → hero verde con headline → intro in corsivo → divider botanico
 * → product cards con immagini → body → pull-quote closing → CTA → footer
 */
export function buildNewsletterHtml(data: NewsletterTemplateData): string {
  const { subject, headline, intro, body, closing, products = [], unsubscribeUrl } = data
  const year = new Date().getFullYear()

  const productRowsHtml = products.map(productCard).join("")
  const bodyHtml = textToParagraphs(body)

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4ee;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3f4ee"
       style="background:#f3f4ee;min-height:100vh;">
  <tr>
    <td align="center" style="padding:28px 16px 48px;">

      <!-- ── LOGO ────────────────────────────────────────────── -->
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;margin-bottom:20px;">
        <tr>
          <td align="center" style="padding:0 0 4px;">
            <a href="${SITE_URL}" style="display:inline-block;text-decoration:none;">
              <img src="${LOGO_URL}" alt="GeF Crochet" height="80" width="143"
                   style="display:block;height:80px;width:143px;" />
            </a>
          </td>
        </tr>
      </table>

      <!-- ── CARD PRINCIPALE ─────────────────────────────────── -->
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;border-radius:14px;overflow:hidden;">

        <!-- ── HERO verde ──────────────────────────────────── -->
        <tr>
          <td bgcolor="#516447" style="background:#516447;padding:36px 40px 30px;text-align:left;">
            <p style="margin:0 0 10px;font-size:10px;color:#93bb83;
                      letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">
              🌿 &nbsp;Newsletter GeF Crochet
            </p>
            <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;
                       font-size:30px;font-weight:400;color:#ffffff;line-height:1.28;">
              ${headline}
            </h1>
          </td>
        </tr>

        <!-- ── STRISCIA INTRO ──────────────────────────────── -->
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;padding:30px 40px 4px;">
            <p style="margin:0;font-size:17px;line-height:1.75;color:#516447;
                      font-style:italic;font-family:Georgia,'Times New Roman',serif;">
              ${intro}
            </p>
          </td>
        </tr>

        <!-- ── DIVIDER botanico ─────────────────────────────── -->
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;padding:20px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-top:1px solid #e4e7da;">&nbsp;</td>
                <td width="36" align="center"
                    style="font-size:22px;color:#93bb83;padding:0 6px;line-height:1;">
                  ❧
                </td>
                <td style="border-top:1px solid #e4e7da;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        ${
          products.length > 0
            ? `<!-- ── PRODOTTI ──────────────────────────────────────── -->
        <tr>
          <td bgcolor="#f8f9f5" style="background:#f8f9f5;padding:8px 32px 4px;">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#516447;
                      letter-spacing:2px;text-transform:uppercase;">
              ✦ &nbsp;In evidenza
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${productRowsHtml}
            </table>
          </td>
        </tr>`
            : ""
        }

        <!-- ── CORPO ────────────────────────────────────────── -->
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;padding:28px 40px 8px;">
            ${bodyHtml}
          </td>
        </tr>

        ${
          closing
            ? `<!-- ── PULL-QUOTE ─────────────────────────────────── -->
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;padding:4px 40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-left:3px solid #516447;padding:14px 18px;
                           background:#f3f4ee;border-radius:0 8px 8px 0;">
                  <p style="margin:0;font-size:15px;line-height:1.75;
                             color:#516447;font-style:italic;
                             font-family:Georgia,'Times New Roman',serif;">
                    ${closing}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
            : ""
        }

        <!-- ── CTA ─────────────────────────────────────────── -->
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;padding:28px 40px 44px;text-align:center;">
            <table cellpadding="0" cellspacing="0" align="center">
              <tr>
                <td bgcolor="#516447"
                    style="background:#516447;border-radius:30px;">
                  <a href="${SITE_URL}/shop"
                     style="display:inline-block;background:#516447;color:#ffffff;
                            font-size:15px;font-weight:700;padding:14px 38px;
                            border-radius:30px;text-decoration:none;
                            letter-spacing:0.4px;white-space:nowrap;">
                    Scopri il negozio &nbsp;→
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:14px 0 0;font-size:12px;color:#9a9e99;">
              oppure visita
              <a href="${SITE_URL}" style="color:#516447;text-decoration:none;">gefcrochet.it</a>
            </p>
          </td>
        </tr>

        <!-- ── FOOTER ───────────────────────────────────────── -->
        <tr>
          <td bgcolor="#516447" style="background:#516447;padding:26px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#b8cdaa;
                      font-family:Georgia,serif;font-style:italic;">
              Fatto con ❤ a mano, in Italia
            </p>
            <p style="margin:0 0 10px;font-size:11px;color:#7a9a6d;">
              © ${year} GeF Crochet
            </p>
            <p style="margin:0;font-size:11px;color:#7a9a6d;line-height:1.7;">
              Hai ricevuto questa email perché sei iscritto alla nostra newsletter.<br/>
              <a href="${unsubscribeUrl}"
                 style="color:#b8cdaa;text-decoration:underline;">Disiscrivi</a>
            </p>
          </td>
        </tr>

      </table><!-- /card -->
    </td>
  </tr>
</table>
</body>
</html>`
}

/** Versione con placeholder (salvata in DB, personalizzata al momento dell'invio) */
export function buildNewsletterHtmlTemplate(data: Omit<NewsletterTemplateData, "unsubscribeUrl">): string {
  return buildNewsletterHtml({ ...data, unsubscribeUrl: UNSUB_PLACEHOLDER })
}

/** Personalizza l'HTML salvato in DB sostituendo il placeholder con l'URL reale */
export function personalizeHtml(html: string, unsubscribeUrl: string): string {
  return html.replaceAll(UNSUB_PLACEHOLDER, unsubscribeUrl)
}

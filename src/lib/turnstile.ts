/**
 * Verifica un token Cloudflare Turnstile lato server.
 * Restituisce true se il token è valido.
 * Se TURNSTILE_SECRET_KEY non è configurata la verifica viene saltata
 * solo fuori produzione (dev locale); in produzione fallisce chiusa.
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Turnstile] TURNSTILE_SECRET_KEY non configurata — verifica saltata (dev)")
      return true
    }
    console.error("[Turnstile] TURNSTILE_SECRET_KEY mancante in produzione — richiesta rifiutata")
    return false
  }
  if (!token) return false

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

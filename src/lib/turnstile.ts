/**
 * Verifica un token Cloudflare Turnstile lato server.
 * Restituisce true se il token è valido.
 * Se TURNSTILE_SECRET_KEY non è configurata (es. dev locale),
 * la verifica viene saltata e ritorna true con un warning.
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.warn("[Turnstile] TURNSTILE_SECRET_KEY non configurata — verifica saltata (dev)")
    return true
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

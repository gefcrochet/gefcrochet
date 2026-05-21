import { createHmac } from "crypto"

const SECRET = process.env.SESSION_SECRET ?? "gefcrochet-captcha-fallback"

export async function GET() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  const answer = a + b
  // 15-minute window so the token stays valid during checkout
  const window = Math.floor(Date.now() / (15 * 60 * 1000))

  const token = createHmac("sha256", SECRET)
    .update(`${answer}:${window}`)
    .digest("hex")
    .slice(0, 24)

  return Response.json({ question: `Quanto fa ${a} + ${b}?`, token })
}

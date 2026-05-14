import { auth } from "@/auth"
import type { NextRequest } from "next/server"

export async function getSession(): Promise<{ userId: string } | null> {
  const session = await auth()
  if (!session?.user?.email) return null
  return { userId: session.user.email }
}

// Used by API route handlers — auth() reads the session from request context automatically
export async function getSessionFromRequest(_req: NextRequest): Promise<{ userId: string } | null> {
  const session = await auth()
  if (!session?.user?.email) return null
  return { userId: session.user.email }
}

import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/session"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isLoginPage = pathname === "/studio/login"
  const session = await getSessionFromRequest(req)

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/studio/login", req.url))
  }
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/studio", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/studio/:path*"],
}

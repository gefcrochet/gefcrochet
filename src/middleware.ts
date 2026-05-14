import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoginPage = pathname.startsWith("/studio/login")

  if (!req.auth && !isLoginPage) {
    return NextResponse.redirect(new URL("/studio/login", req.url))
  }
})

export const config = {
  matcher: ["/studio/:path*"],
}

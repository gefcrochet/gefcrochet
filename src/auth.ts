import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const ALLOWED_EMAILS = new Set([
  "gabrielemichelenapoli@gmail.com",
  "taglioni.federica@gmail.com",
])

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn({ user }) {
      return ALLOWED_EMAILS.has(user.email ?? "")
    },
  },
  pages: {
    signIn: "/studio/login",
    error: "/studio/login",
  },
})

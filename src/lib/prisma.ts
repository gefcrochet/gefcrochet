import { PrismaClient } from "@/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:dev.db"
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined
  const adapter = new PrismaLibSql({ url, authToken })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

globalForPrisma.prisma ??= createPrismaClient()
export const prisma = globalForPrisma.prisma

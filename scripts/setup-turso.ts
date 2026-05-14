import { createClient } from "@libsql/client"
import { readFileSync } from "fs"
import { join } from "path"

const url = process.env.DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error("DATABASE_URL e TURSO_AUTH_TOKEN sono richiesti")
  process.exit(1)
}

const client = createClient({ url, authToken })

const raw = readFileSync(join(__dirname, "../prisma/turso_schema.sql"), "utf-8")

// Remove comment lines, then split on semicolons
const stripped = raw
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n")

const statements = stripped
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

async function main() {
  console.log(`Esecuzione di ${statements.length} statement SQL su Turso...`)
  let ok = 0
  let skip = 0
  for (const stmt of statements) {
    try {
      await client.execute(stmt)
      ok++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        skip++
      } else {
        console.error(`Errore: ${msg}\nStatement: ${stmt.slice(0, 100)}`)
      }
    }
  }
  console.log(`Completato: ${ok} eseguiti, ${skip} già esistenti.`)
}

main().catch(console.error).finally(() => client.close())

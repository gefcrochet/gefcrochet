import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const url = process.env.DATABASE_URL ?? "file:dev.db"
const authToken = process.env.TURSO_AUTH_TOKEN || undefined
const adapter = new PrismaLibSql({ url, authToken })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash("floraefiber2024", 12)
  await prisma.user.upsert({
    where: { email: "gef@floraandfiber.it" },
    update: {},
    create: { email: "gef@floraandfiber.it", passwordHash, name: "Gef" },
  })

  // Categories
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: "borse" }, update: {}, create: { name: "Borse", slug: "borse" } }),
    prisma.category.upsert({ where: { slug: "abbigliamento" }, update: {}, create: { name: "Abbigliamento", slug: "abbigliamento" } }),
    prisma.category.upsert({ where: { slug: "accessori" }, update: {}, create: { name: "Accessori", slug: "accessori" } }),
    prisma.category.upsert({ where: { slug: "casa" }, update: {}, create: { name: "Casa", slug: "casa" } }),
  ])
  const [borse, abbigliamento, accessori, casa] = cats

  // Products
  const products = [
    {
      name: "Borsa Tote Botanical",
      slug: "borsa-tote-botanical",
      description: "Borsa tote capiente realizzata con cotone biologico non candeggiato. Manici lunghi, doppio fondo, tasca interna in tela. Il motivo botanico in rilievo viene lavorato a mano riga per riga.",
      price: 8500,
      stock: 4,
      isActive: true,
      isFeatured: true,
      categoryId: borse.id,
    },
    {
      name: "Cestino Intreccio Terra",
      slug: "cestino-intreccio-terra",
      description: "Cestino porta-oggetti in cotone macramè naturale. Perfetto per scrivania, bagno o comodino. Struttura semi-rigida, fondo piatto stabile.",
      price: 3200,
      stock: 8,
      isActive: true,
      isFeatured: false,
      categoryId: casa.id,
    },
    {
      name: "Top Estivo Raffia",
      slug: "top-estivo-raffia",
      description: "Top senza maniche con lavorazione a rete aperta in raffia naturale. Leggero, traspirante, taglia unica. Adatto alle stagioni calde.",
      price: 6500,
      salePrice: 5200,
      stock: 2,
      isActive: true,
      isFeatured: true,
      categoryId: abbigliamento.id,
    },
    {
      name: "Fermagli Fiore",
      slug: "fermagli-fiore",
      description: "Set di 3 fermagli per capelli con fiori a crochet in cotone pettinato. Colori naturali: avorio, salvia, terracotta.",
      price: 2200,
      stock: 12,
      isActive: true,
      isFeatured: false,
      categoryId: accessori.id,
    },
    {
      name: "Copricapo Sole",
      slug: "copricapo-sole",
      description: "Cappello estivo a tesa larga in raffia e cotone misto. Protezione dal sole con stile artigianale.",
      price: 5500,
      stock: 5,
      isActive: true,
      isFeatured: true,
      categoryId: abbigliamento.id,
    },
    {
      name: "Cuscino Intreccio Boho",
      slug: "cuscino-intreccio-boho",
      description: "Fodera per cuscino 40×40 in cotone grezzo con texture fitta. Imbottitura non inclusa.",
      price: 4800,
      stock: 3,
      isActive: true,
      isFeatured: false,
      categoryId: casa.id,
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
  }

  // Sample collection
  const allProducts = await prisma.product.findMany({ take: 3 })
  await prisma.collection.upsert({
    where: { slug: "estate-2024" },
    update: {},
    create: {
      name: "Estate 2024",
      slug: "estate-2024",
      heroTitle: "Crochet d'estate",
      heroSubtitle: "Leggerezza naturale per i giorni caldi",
      isActive: true,
      products: {
        create: allProducts.map((p, i) => ({ productId: p.id, position: i })),
      },
    },
  })

  console.log("Seed completato.")
  console.log("Email: gef@floraandfiber.it")
  console.log("Password: floraefiber2024")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

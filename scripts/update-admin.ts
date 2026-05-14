import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const email = "info@gefcrochet.it"
  const password = "Edefirbagele#192705"
  const passwordHash = await bcrypt.hash(password, 10)

  // Find existing user or create
  const existingUser = await prisma.user.findFirst()

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { email, passwordHash, name: "Admin" },
    })
    console.log("Admin user updated.")
  } else {
    await prisma.user.create({
      data: { email, passwordHash, name: "Admin" },
    })
    console.log("Admin user created.")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

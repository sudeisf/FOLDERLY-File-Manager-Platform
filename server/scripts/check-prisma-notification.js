const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  console.log('has notification model:', Boolean(prisma.notification))
  console.log('models:', Object.keys(prisma).filter((k) => !k.startsWith('$')).sort())
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  process.exit(1)
})

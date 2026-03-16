import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create or find the guest user
  const guestUser = await prisma.user.upsert({
    where: { id: 'guest-user-id' },
    update: {},
    create: {
      id: 'guest-user-id',
      name: 'Guest',
      email: 'guest@liveinterview.local',
      emailVerified: true,
    },
  })

  console.log('Guest user created/found:', guestUser)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

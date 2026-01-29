import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Barbers
  const barber1 = await prisma.barber.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'John Doe',
      color: '#FF5733',
    },
  })

  const barber2 = await prisma.barber.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Jane Smith',
      color: '#33FF57',
    },
  })

  // Create Services
  const service1 = await prisma.service.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Haircut',
      duration: 30,
      price: 25.0,
    },
  })

  const service2 = await prisma.service.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Beard Trim',
      duration: 15,
      price: 15.0,
    },
  })

  // Create Admin
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'password123', // In real app, hash this
    },
  })

  // Create Schedules
  // Barber 1: Mon-Fri 9-5
  for (let i = 1; i <= 5; i++) {
    await prisma.schedule.upsert({
      where: { barberId_dayOfWeek: { barberId: 1, dayOfWeek: i } },
      update: {},
      create: {
        barberId: 1,
        dayOfWeek: i,
        startTime: '09:00',
        endTime: '17:00',
      },
    })
  }

  // Barber 2: Tue-Sat 10-6
  for (let i = 2; i <= 6; i++) {
    await prisma.schedule.upsert({
      where: { barberId_dayOfWeek: { barberId: 2, dayOfWeek: i } },
      update: {},
      create: {
        barberId: 2,
        dayOfWeek: i,
        startTime: '10:00',
        endTime: '18:00',
      },
    })
  }

  console.log({ barber1, barber2, service1, service2 })
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

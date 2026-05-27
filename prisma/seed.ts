import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 10000;
  const keylen = 64;
  const digest = 'sha512';
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

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

  // Create Admin with securely hashed password
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      password: hashPassword('password123')
    },
    create: {
      username: 'admin',
      password: hashPassword('password123'),
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

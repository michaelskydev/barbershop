import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Clearing all appointments...')
    const deleted = await prisma.appointment.deleteMany({})
    console.log(`Successfully deleted ${deleted.count} appointments.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

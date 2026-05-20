const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
    console.log('--- Starting SQLite Database Backup (JS) ---')
    
    console.log('Fetching Barbers...')
    const barbers = await prisma.barber.findMany()
    
    console.log('Fetching Services...')
    const services = await prisma.service.findMany()
    
    console.log('Fetching Appointments...')
    const appointments = await prisma.appointment.findMany()
    
    console.log('Fetching Admins...')
    const admins = await prisma.admin.findMany()
    
    console.log('Fetching Schedules...')
    const schedules = await prisma.schedule.findMany()
    
    console.log('Fetching AboutInfo...')
    const aboutInfo = await prisma.aboutInfo.findMany()
    
    console.log('Fetching AboutImages...')
    const aboutImages = await prisma.aboutImage.findMany()

    const backupData = {
        barber: barbers,
        service: services,
        appointment: appointments,
        admin: admins,
        schedule: schedules,
        aboutInfo: aboutInfo,
        aboutImage: aboutImages
    }

    const backupPath = path.join(__dirname, '../prisma/backup.json')
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')
    
    console.log('--- SQLite Database Backup Completed ---')
    console.log(`Saved ${barbers.length} barbers`)
    console.log(`Saved ${services.length} services`)
    console.log(`Saved ${appointments.length} appointments`)
    console.log(`Saved ${admins.length} admins`)
    console.log(`Saved ${schedules.length} schedules`)
    console.log(`Saved ${aboutInfo.length} aboutInfo entries`)
    console.log(`Saved ${aboutImages.length} aboutImages`)
    console.log(`Backup file written to: ${backupPath}`)
}

main()
    .catch((e) => {
        console.error('Backup failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
    console.log('--- Starting Supabase Database Restoration ---')

    const backupPath = path.join(__dirname, '../prisma/backup.json')
    if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found at: ${backupPath}`)
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))
    console.log('Successfully loaded backup data.')

    // 1. Insert Barbers
    console.log(`Restoring ${backupData.barber.length} Barbers...`)
    for (const item of backupData.barber) {
        await prisma.barber.create({ data: item })
    }

    // 2. Insert Services
    console.log(`Restoring ${backupData.service.length} Services...`)
    for (const item of backupData.service) {
        await prisma.service.create({ data: item })
    }

    // 3. Insert Admins
    console.log(`Restoring ${backupData.admin.length} Admins...`)
    for (const item of backupData.admin) {
        await prisma.admin.create({ data: item })
    }

    // 4. Insert AboutInfo
    console.log(`Restoring ${backupData.aboutInfo.length} AboutInfo entries...`)
    for (const item of backupData.aboutInfo) {
        // Convert dates if needed (Prisma handles Date strings automatically)
        await prisma.aboutInfo.create({ data: item })
    }

    // 5. Insert AboutImages
    console.log(`Restoring ${backupData.aboutImage.length} AboutImages...`)
    for (const item of backupData.aboutImage) {
        await prisma.aboutImage.create({ data: item })
    }

    // 6. Insert Schedules
    console.log(`Restoring ${backupData.schedule.length} Schedules...`)
    for (const item of backupData.schedule) {
        await prisma.schedule.create({ data: item })
    }

    // 7. Insert Appointments
    console.log(`Restoring ${backupData.appointment.length} Appointments...`)
    for (const item of backupData.appointment) {
        await prisma.appointment.create({ data: item })
    }

    // 8. Reset Auto-Increment Sequences in PostgreSQL
    console.log('Resetting PostgreSQL ID sequences to prevent collisions...')
    const tablesToReset = ['Barber', 'Service', 'Appointment', 'Admin', 'Schedule', 'AboutImage']
    
    for (const tableName of tablesToReset) {
        try {
            // Run standard pg_get_serial_sequence sequence reset
            const seqQuery = `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), coalesce(max(id), 1)) FROM "${tableName}";`
            await prisma.$executeRawUnsafe(seqQuery)
            console.log(`Successfully reset sequence for table "${tableName}"`)
        } catch (seqError) {
            console.warn(`Warning resetting sequence for table "${tableName}":`, seqError.message)
        }
    }

    console.log('--- Supabase Database Restoration Completed Successfully ---')
}

main()
    .catch((e) => {
        console.error('Restoration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barberId')
    const date = searchParams.get('date')

    const where: any = {}
    if (barberId) where.barberId = parseInt(barberId)
    if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        where.startDate = {
            gte: startOfDay,
            lte: endOfDay
        }
    }

    const appointments = await prisma.appointment.findMany({
        where,
        include: {
            barber: true,
            service: true
        }
    })
    return NextResponse.json(appointments)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { customerName, customerEmail, startDate, barberId, serviceId } = body

        // Calculate end date based on service duration
        const service = await prisma.service.findUnique({ where: { id: serviceId } })
        if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 400 })

        // Basic conflict check
        // In a real app, do better overlapping checks

        const appointment = await prisma.appointment.create({
            data: {
                customerName,
                customerEmail,
                startDate: new Date(startDate),
                status: 'PENDING',
                barberId,
                serviceId
            }
        })

        return NextResponse.json(appointment)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }
}

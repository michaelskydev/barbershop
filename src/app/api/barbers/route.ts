import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const barbers = await prisma.barber.findMany({
        include: { schedules: true }
    })
    return NextResponse.json(barbers)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, color } = body

        const barber = await prisma.barber.create({
            data: { name, color }
        })

        // Create default schedule (Mon-Fri 9-5)
        for (let i = 1; i <= 5; i++) {
            await prisma.schedule.create({
                data: {
                    barberId: barber.id,
                    dayOfWeek: i,
                    startTime: '09:00',
                    endTime: '17:00'
                }
            })
        }

        return NextResponse.json(barber)
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

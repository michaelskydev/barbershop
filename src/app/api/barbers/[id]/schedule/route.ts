import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr)

    const schedules = await prisma.schedule.findMany({
        where: { barberId: id },
        orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json(schedules)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr)
    const body = await request.json()
    const { schedules } = body // Expect array of schedules

    for (const s of schedules) {
        await prisma.schedule.upsert({
            where: { barberId_dayOfWeek: { barberId: id, dayOfWeek: s.dayOfWeek } },
            update: { startTime: s.startTime, endTime: s.endTime, active: s.active },
            create: {
                barberId: id,
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                active: s.active
            }
        })
    }

    return NextResponse.json({ success: true })
}

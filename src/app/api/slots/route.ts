import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    const dateStr = searchParams.get('date');

    if (!barberId || !dateStr) {
        return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = date.getUTCDay(); // 0-6 in UTC

    // 1. Get Barber Schedule for this day
    const schedule = await (prisma as any).schedule.findUnique({
        where: {
            barberId_dayOfWeek: {
                barberId: parseInt(barberId),
                dayOfWeek: dayOfWeek
            }
        }
    });

    if (!schedule || !schedule.active) {
        return NextResponse.json([]); // Not working today
    }

    // 2. Generate possible slots
    const slots = [];
    let [startHour, startMin] = schedule.startTime.split(':').map(Number);
    let [endHour, endMin] = schedule.endTime.split(':').map(Number);

    let current = new Date(date);
    current.setUTCHours(startHour, startMin, 0, 0);

    const end = new Date(date);
    end.setUTCHours(endHour, endMin, 0, 0);

    // 3. Get existing appointments
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
        where: {
            barberId: parseInt(barberId),
            startDate: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: { not: 'REJECTED' }
        },
        include: { service: true }
    });

    // Simple slot generation (hourly for now - in real app, fit based on service duration)
    // For this MVP, let's assume 1 hour slots for simplicity or stick to the fixed list but filtered
    // Let's generate 60 min slots

    while (current < end) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30); // 30 min granularity

        // Check collision
        const isTaken = appointments.some(app => {
            const appStart = new Date(app.startDate);
            const appEnd = new Date(appStart);
            appEnd.setUTCMinutes(appEnd.getUTCMinutes() + app.service.duration);

            // Simple overlap check
            return (slotStart < appEnd && slotEnd > appStart);
        });

        if (!isTaken) {
            slots.push(slotStart.toISOString().substring(11, 16)); // "HH:mm" from UTC
        }

        current.setUTCMinutes(current.getUTCMinutes() + 30); // 30 min granularity
    }

    return NextResponse.json(slots);
}

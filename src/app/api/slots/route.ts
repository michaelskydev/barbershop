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
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0-6

    // 1. Get Barber Schedule for this day
    const schedule = await prisma.schedule.findUnique({
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
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMin, 0, 0);

    // 3. Get existing appointments
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

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
            appEnd.setMinutes(appEnd.getMinutes() + app.service.duration);

            // Simple overlap check
            return (slotStart < appEnd && slotEnd > appStart);
        });

        if (!isTaken) {
            slots.push(slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        }

        current.setMinutes(current.getMinutes() + 60); // Increment by 1 hour (simplified logic)
    }

    return NextResponse.json(slots);
}

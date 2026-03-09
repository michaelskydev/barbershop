import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barberId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const where: any = {}
    if (barberId) where.barberId = parseInt(barberId)
    if (status) where.status = status
    if (date) {
        const [year, month, day] = date.split('-').map(Number);
        const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

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
        console.log('Received appointment request:', JSON.stringify(body, null, 2));

        const { customerName, customerEmail, customerPhone, startDate, barberId, serviceId } = body

        if (!barberId || !serviceId || !startDate || !customerName || !customerEmail) {
            console.error('Missing required fields:', { barberId, serviceId, startDate, customerName, customerEmail });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure IDs are numbers
        const bId = parseInt(String(barberId));
        const sId = parseInt(String(serviceId));

        if (isNaN(bId) || isNaN(sId)) {
            console.error('Invalid IDs:', { barberId, serviceId });
            return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
        }

        // Validate service existence
        const service = await prisma.service.findUnique({ where: { id: sId } })
        if (!service) {
            console.error('Service not found:', sId);
            return NextResponse.json({ error: 'Service not found' }, { status: 400 });
        }

        // Validate barber existence
        const barber = await prisma.barber.findUnique({ where: { id: bId } });
        if (!barber) {
            console.error('Barber not found:', bId);
            return NextResponse.json({ error: 'Barber not found' }, { status: 400 });
        }

        const appointmentData: any = {
            customerName,
            customerEmail,
            customerPhone: customerPhone || null,
            startDate: new Date(startDate),
            status: 'PENDING',
            barberId: bId,
            serviceId: sId
        };

        console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));

        const appointment = await prisma.appointment.create({
            data: appointmentData
        })

        console.log('Appointment created successfully:', appointment.id);

        // Send "Booking Received" Email
        const formattedDate = new Date(startDate).toLocaleString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        await sendEmail({
            to: customerEmail,
            subject: 'We received your booking request!',
            html: `
                <h2>Hello ${customerName},</h2>
                <p>We've received your appointment request for a <strong>${service.name}</strong> with <strong>${barber.name}</strong>.</p>
                <p><strong>Requested Date & Time:</strong> ${formattedDate}</p>
                <br/>
                <p>Please note: This is just a request. You will receive another email shortly once your barber confirms the appointment.</p>
                <br/>
                <p>See you soon,<br>The Barbershop Team</p>
            `
        });

        return NextResponse.json(appointment)
    } catch (error: any) {
        console.error('Error creating appointment:', error)
        return NextResponse.json({
            error: 'Failed to create appointment',
            details: error.message
        }, { status: 500 })
    }
}

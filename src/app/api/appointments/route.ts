import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barberId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const where: { barberId?: number; status?: string; startDate?: { gte: Date; lte: Date } } = {}
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

        const appointmentData: {
            customerName: string;
            customerEmail: string;
            customerPhone: string | null;
            startDate: Date;
            status: string;
            barberId: number;
            serviceId: number;
        } = {
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
            hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
        });

        // Fetch shop info for the email
        const aboutInfo = await prisma.aboutInfo.findFirst();
        const shopLocationHtml = aboutInfo ? `
            <p><strong>Location:</strong> <a href="${aboutInfo.mapsUrl}">${aboutInfo.address}</a></p>
        ` : '';

        await sendEmail({
            to: customerEmail,
            subject: 'We received your booking request!',
            html: `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: #d4af37; font-family: 'Georgia', serif; font-size: 2.2rem; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Splitt Ends</h1>
                    <p style="color: #888; font-size: 0.9rem; text-transform: uppercase; margin: 0.25rem 0 0 0;">Stylist & Barber</p>
                </div>

                <h2>Hello ${customerName},</h2>
                <p>We've received your appointment request. Here are the requested booking details:</p>
                
                <div style="background-color: #1a1a1a; padding: 1.5rem; border-radius: 8px; color: #ffffff; border: 1px solid #333; margin: 1.5rem 0;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>Event:</strong> ${service.name} with ${barber.name}</p>
                    <p style="margin: 0 0 0.5rem 0;"><strong>Requested Date & Time:</strong> ${formattedDate}</p>
                    ${aboutInfo ? `<p style="margin: 0 0 0.5rem 0;"><strong>Location:</strong> <a href="${aboutInfo.mapsUrl}" style="color: #d4af37; text-decoration: underline;">${aboutInfo.address}</a></p>` : ''}
                    <p style="margin: 0;"><strong>Contact Phone:</strong> <a href="tel:9024298360" style="color: #d4af37; text-decoration: underline;">(902) 429-8360</a></p>
                </div>

                <p style="background: rgba(212, 175, 55, 0.05); border-left: 4px solid #888; padding: 1rem; color: #aaa; font-style: italic; border-radius: 4px;">
                    ⚠️ Please note: This is just a request. You will receive another email shortly once our team confirms your appointment slot.
                </p>

                <br />
                <p>See you soon,</p>
                <p><strong>The Splittends Team</strong></p>
            `
        });

        // Send Admin Notification Email
        const adminEmail = process.env.CONTACT_RECEIVER_EMAIL || 'splittend2018@gmail.com';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.splittends.ca';

        try {
            await sendEmail({
                to: adminEmail,
                subject: `📋 New Booking Request — ${customerName}`,
                html: `
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h1 style="color: #d4af37; font-family: 'Georgia', serif; font-size: 2.2rem; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Splitt Ends</h1>
                        <p style="color: #888; font-size: 0.9rem; text-transform: uppercase; margin: 0.25rem 0 0 0;">Stylist &amp; Barber</p>
                    </div>

                    <h2 style="color: #d4af37;">🔔 New Booking Request</h2>
                    <p>A new appointment request has been submitted and is waiting for your review.</p>

                    <div style="background-color: #1a1a1a; padding: 1.5rem; border-radius: 8px; color: #ffffff; border: 1px solid #333; margin: 1.5rem 0;">
                        <p style="margin: 0 0 0.5rem 0;"><strong>Customer:</strong> ${customerName}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #d4af37; text-decoration: underline;">${customerEmail}</a></p>
                        ${customerPhone ? `<p style="margin: 0 0 0.5rem 0;"><strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #d4af37; text-decoration: underline;">${customerPhone}</a></p>` : ''}
                        <hr style="border: none; border-top: 1px solid #333; margin: 0.75rem 0;" />
                        <p style="margin: 0 0 0.5rem 0;"><strong>Service:</strong> ${service.name}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Barber:</strong> ${barber.name}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Requested Date &amp; Time:</strong> ${formattedDate}</p>
                        <p style="margin: 0;"><strong>Booking ID:</strong> #${appointment.id}</p>
                    </div>

                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="${siteUrl}/admin" style="display: inline-block; background-color: #d4af37; color: #000; padding: 0.75rem 2rem; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 1rem;">
                            View in Dashboard →
                        </a>
                    </div>

                    <p style="color: #888; font-size: 0.85rem; text-align: center;">
                        This is an automated notification from your Splittends booking system.
                    </p>
                `
            });
            console.log('Admin notification email sent to:', adminEmail);
        } catch (emailError) {
            // Don't fail the booking if admin notification fails
            console.error('Failed to send admin notification email:', emailError);
        }

        return NextResponse.json(appointment)
    } catch (error: unknown) {
        console.error('Error creating appointment:', error)
        return NextResponse.json({
            error: 'Failed to create appointment',
            details: (error as Error).message
        }, { status: 500 })
    }
}

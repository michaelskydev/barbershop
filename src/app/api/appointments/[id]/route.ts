import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateICS, FullAppointment } from '@/lib/email'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();
        const { status, startDate, barberId } = body;

        const updateData: { status?: string; startDate?: string; barberId?: number } = {};
        if (status !== undefined) updateData.status = status;
        if (startDate !== undefined) updateData.startDate = startDate;
        if (barberId !== undefined) updateData.barberId = parseInt(barberId);

        const appointment = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: { barber: true, service: true }
        });

        // Email Notifications
        const formattedDate = new Date(appointment.startDate).toLocaleString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
        });

        const aboutInfo = await prisma.aboutInfo.findFirst();
        const shopLocationHtml = aboutInfo ? `
            <p><strong>Location:</strong> <a href="${aboutInfo.mapsUrl}">${aboutInfo.address}</a></p>
        ` : '';

        if (status === 'APPROVED') {
            const icsString = generateICS(appointment as FullAppointment);
            await sendEmail({
                to: appointment.customerEmail,
                subject: 'Booking Confirmed!',
                html: `
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h1 style="color: #d4af37; font-family: 'Georgia', serif; font-size: 2.2rem; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Splitt Ends</h1>
                        <p style="color: #888; font-size: 0.9rem; text-transform: uppercase; margin: 0.25rem 0 0 0;">Stylist & Barber</p>
                    </div>

                    <h2>Great news, ${appointment.customerName}!</h2>
                    <p>Your appointment has been confirmed. Here are your booking details:</p>
                    
                    <div style="background-color: #1a1a1a; padding: 1.5rem; border-radius: 8px; color: #ffffff; border: 1px solid #333; margin: 1.5rem 0;">
                        <p style="margin: 0 0 0.5rem 0;"><strong>Event:</strong> ${appointment.service.name} with ${appointment.barber.name}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Requested Date & Time:</strong> ${formattedDate}</p>
                        ${aboutInfo ? `<p style="margin: 0 0 0.5rem 0;"><strong>Location:</strong> <a href="${aboutInfo.mapsUrl}" style="color: #d4af37; text-decoration: underline;">${aboutInfo.address}</a></p>` : ''}
                        <p style="margin: 0;"><strong>Contact Phone:</strong> <a href="tel:9024298360" style="color: #d4af37; text-decoration: underline;">(902) 429-8360</a></p>
                    </div>

                    <p style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 1rem; color: #d4af37; font-weight: bold; border-radius: 4px;">
                        ⏰ Please arrive a few minutes before your scheduled time so we can start promptly.
                    </p>

                    <p>We've attached a calendar invite (.ics) to this email so you can easily add it to your calendar.</p>
                    <br />
                    <p>See you soon,</p>
                    <p><strong>The Splittends Team</strong></p>
                `,
                icsString
            });
        } else if (status === 'REJECTED') {
            await sendEmail({
                to: appointment.customerEmail,
                subject: 'Booking Update',
                html: `
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h1 style="color: #d4af37; font-family: 'Georgia', serif; font-size: 2.2rem; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Splitt Ends</h1>
                        <p style="color: #888; font-size: 0.9rem; text-transform: uppercase; margin: 0.25rem 0 0 0;">Stylist & Barber</p>
                    </div>
                    <h2>Hello ${appointment.customerName},</h2>
                    <p>Unfortunately, we cannot accommodate your appointment request for a <strong>${appointment.service.name}</strong> on ${formattedDate}.</p>
                    <p>Please visit our site to book a different time.</p>
                `
            });
        } else if (startDate !== undefined || barberId !== undefined) {
            // It was rescheduled
            const icsString = generateICS(appointment as FullAppointment);
            await sendEmail({
                to: appointment.customerEmail,
                subject: 'Your Booking was Rescheduled',
                html: `
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h1 style="color: #d4af37; font-family: 'Georgia', serif; font-size: 2.2rem; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Splitt Ends</h1>
                        <p style="color: #888; font-size: 0.9rem; text-transform: uppercase; margin: 0.25rem 0 0 0;">Stylist & Barber</p>
                    </div>

                    <h2>Hello ${appointment.customerName},</h2>
                    <p>Your appointment has been updated by the barbershop. Here are your new booking details:</p>

                    <div style="background-color: #1a1a1a; padding: 1.5rem; border-radius: 8px; color: #ffffff; border: 1px solid #333; margin: 1.5rem 0;">
                        <p style="margin: 0 0 0.5rem 0;"><strong>Event:</strong> ${appointment.service.name} with ${appointment.barber.name}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Requested Date & Time:</strong> ${formattedDate}</p>
                        ${aboutInfo ? `<p style="margin: 0 0 0.5rem 0;"><strong>Location:</strong> <a href="${aboutInfo.mapsUrl}" style="color: #d4af37; text-decoration: underline;">${aboutInfo.address}</a></p>` : ''}
                        <p style="margin: 0;"><strong>Contact Phone:</strong> <a href="tel:9024298360" style="color: #d4af37; text-decoration: underline;">(902) 429-8360</a></p>
                    </div>

                    <p style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 1rem; color: #d4af37; font-weight: bold; border-radius: 4px;">
                        ⏰ Please arrive a few minutes before your scheduled time so we can start promptly.
                    </p>

                    <p>We've attached an updated calendar invite (.ics). If this new time doesn't work for you, please let us know.</p>
                    <br />
                    <p>See you soon,</p>
                    <p><strong>The Splittends Team</strong></p>
                `,
                icsString
            });
        }

        return NextResponse.json(appointment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        await prisma.appointment.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

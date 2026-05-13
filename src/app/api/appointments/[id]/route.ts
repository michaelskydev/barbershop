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
                    <h2>Great news, ${appointment.customerName}!</h2>
                    <p>Your appointment for a <strong>${appointment.service.name}</strong> with <strong>${appointment.barber.name}</strong> has been confirmed.</p>
                    <p><strong>Date & Time:</strong> ${formattedDate}</p>
                    ${shopLocationHtml}
                    <p>We've attached a calendar invite so you don't forget. See you soon!</p>
                `,
                icsString
            });
        } else if (status === 'REJECTED') {
            await sendEmail({
                to: appointment.customerEmail,
                subject: 'Booking Update',
                html: `
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
                    <h2>Hello ${appointment.customerName},</h2>
                    <p>Your appointment has been updated by the barbershop.</p>
                    <p><strong>New Service:</strong> ${appointment.service.name}<br/>
                    <strong>New Barber:</strong> ${appointment.barber.name}<br/>
                    <strong>New Date & Time:</strong> ${formattedDate}</p>
                    ${shopLocationHtml}
                    <p>We've attached an updated calendar invite. If this time doesn't work for you, please contact us.</p>
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

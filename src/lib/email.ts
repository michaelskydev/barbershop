import { Resend } from 'resend';
import * as ics from 'ics';
import { Appointment, Barber, Service } from '@prisma/client';

// Initialize Resend with placeholder or real API key
// During development without a key, we'll log the email instead of sending
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Resend's default testing email

export type FullAppointment = Appointment & {
    barber: Barber;
    service: Service;
};

/**
 * Generates an ICS file string for the given appointment.
 */
export function generateICS(appointment: FullAppointment): string | null {
    const startDate = new Date(appointment.startDate);
    const endDate = new Date(startDate.getTime() + appointment.service.duration * 60000);

    const event: ics.EventAttributes = {
        title: `Haircut with ${appointment.barber.name}`,
        description: `Service: ${appointment.service.name}\nBarber: ${appointment.barber.name}\nPrice: $${appointment.service.price}`,
        start: [
            startDate.getUTCFullYear(),
            startDate.getUTCMonth() + 1,
            startDate.getUTCDate(),
            startDate.getUTCHours(),
            startDate.getUTCMinutes()
        ],
        end: [
            endDate.getUTCFullYear(),
            endDate.getUTCMonth() + 1,
            endDate.getUTCDate(),
            endDate.getUTCHours(),
            endDate.getUTCMinutes()
        ],
        startInputType: 'local',
        endInputType: 'local',
        status: 'CONFIRMED',
        organizer: { name: 'Barbershop', email: fromEmail },
    };

    const { error, value } = ics.createEvent(event);

    if (error) {
        console.error('Failed to generate ICS file:', error);
        return null;
    }

    return value || null;
}

/**
 * Sends a standard email using Resend.
 */
export async function sendEmail({
    to,
    subject,
    html,
    icsString
}: {
    to: string;
    subject: string;
    html: string;
    icsString?: string | null;
}) {
    // If no API key is provided, just log it (useful for local testing before signup)
    if (!resend) {
        console.log('\n=======================================');
        console.log(`[EMAIL MOCK] To: ${to}`);
        console.log(`[EMAIL MOCK] Subject: ${subject}`);
        if (icsString) console.log(`[EMAIL MOCK] Included Calendar Attachment`);
        console.log('=======================================\n');
        return true;
    }

    try {
        const attachments = icsString ? [
            {
                filename: 'invite.ics',
                content: Buffer.from(icsString, 'utf-8'),
                contentType: 'text/calendar'
            }
        ] : undefined;

        await resend.emails.send({
            from: `Barbershop <${fromEmail}>`,
            to,
            subject,
            html,
            attachments
        });
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

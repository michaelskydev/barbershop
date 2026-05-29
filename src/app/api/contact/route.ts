import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'splittend2018@gmail.com';

export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!resend) {
            console.warn('Resend is not configured. Falling back to mock contact message.');
            console.log('Contact message received:', { name, email, message });
            return NextResponse.json({ success: true, mock: true });
        }

        const data = await resend.emails.send({
            from: fromEmail,
            to: receiverEmail,
            subject: `New Contact Form Message from ${name}`,
            html: `
                <h3>New Contact Message</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });

        console.log('Contact form email sent successfully:', data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

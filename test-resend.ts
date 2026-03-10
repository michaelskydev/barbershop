import 'dotenv/config';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
console.log('API Key starts with:', resendApiKey ? resendApiKey.substring(0, 5) + '...' : 'Missing');

const resend = new Resend(resendApiKey);

async function testEmail() {
    try {
        console.log('Attempting to send test email...');
        const data = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: 'michaelskydev@gmail.com',
            subject: 'Barbershop App - Resend Connection Test',
            html: '<p>If you are reading this, your Resend API key is correctly configured and successfully sending emails from your Next.js application!</p>'
        });

        console.log('Email sent successfully!');
        console.log('Response:', data);
    } catch (error) {
        console.error('Failed to send email:');
        console.error(error);
    }
}

testEmail();

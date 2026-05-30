import { PrismaClient } from '@prisma/client';
import { sendEmail, generateICS } from './src/lib/email.js';

const prisma = new PrismaClient();

async function testBookingFlow() {
    try {
        console.log('1. Fetching test metadata...');
        const barber = await prisma.barber.findFirst();
        const service = await prisma.service.findFirst();
        
        if (!barber || !service) {
            console.error('Missing Barbers or Services records in the database. Please seed first.');
            return;
        }

        console.log(`Using Barber: ${barber.name} (ID: ${barber.id})`);
        console.log(`Using Service: ${service.name} (ID: ${service.id})`);

        // 2. Insert a temporary pending appointment
        console.log('2. Inserting test booking into database...');
        const nextWeekDate = new Date();
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        nextWeekDate.setUTCHours(14, 0, 0, 0); // 2:00 PM UTC

        const appointment = await prisma.appointment.create({
            data: {
                customerName: 'Test Customer',
                customerEmail: 'michaelskydev@gmail.com', // Where verification email goes
                customerPhone: '555-0199',
                startDate: nextWeekDate,
                status: 'PENDING',
                barberId: barber.id,
                serviceId: service.id
            },
            include: {
                barber: true,
                service: true
            }
        });

        console.log(`Test booking created successfully (ID: ${appointment.id})`);

        // 3. Simulate Admin Approving the Appointment (triggering email notification)
        console.log('3. Simulating admin approval status and triggering live notification...');
        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: 'APPROVED' },
            include: { barber: true, service: true }
        });

        const formattedDate = new Date(updatedAppointment.startDate).toLocaleString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
        });

        const icsString = generateICS(updatedAppointment);
        const emailSent = await sendEmail({
            to: updatedAppointment.customerEmail,
            subject: 'Test Booking Confirmed!',
            html: `
                <h2>Great news, ${updatedAppointment.customerName}!</h2>
                <p>This is a live test of your barbershop booking system.</p>
                <p>Your appointment for a <strong>${updatedAppointment.service.name}</strong> with <strong>${updatedAppointment.barber.name}</strong> has been confirmed.</p>
                <p><strong>Date & Time:</strong> ${formattedDate}</p>
                <p>We've attached a calendar invite so you don't forget. See you soon!</p>
            `,
            icsString
        });

        if (emailSent) {
            console.log('Live email sent successfully to your test inbox!');
        } else {
            console.error('Email failed to send. Check API credentials or verified domain settings.');
        }

        // 4. Cleanup test data
        console.log('4. Cleaning up test database entry...');
        await prisma.appointment.delete({
            where: { id: appointment.id }
        });
        console.log('Database cleaned. Test sequence completed successfully!');

    } catch (err) {
        console.error('Error running test booking:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testBookingFlow();

const API_URL = 'http://localhost:3000/api';

async function testFullBookingFlow() {
    console.log('1. Creating a new appointment request...');

    // Set appointment date to tomorrow at 10:00 AM UTC
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 1);
    date.setUTCHours(10, 0, 0, 0);

    try {
        const createRes = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                barberId: 1, // Assume barber 1 exists
                serviceId: 1, // Assume service 1 exists
                startDate: date.toISOString(),
                customerName: "Michael Sky (Test)",
                customerEmail: "michaelskydev@gmail.com",
                customerPhone: "555-0101"
            })
        });

        if (!createRes.ok) {
            console.error('Failed to create!', await createRes.text());
            return;
        }

        const appointment = await createRes.json();
        console.log(`✅ Appointment created (ID: ${appointment.id})`);
        console.log('⏳ Waiting 3 seconds before approving it...');

        // Wait a few seconds to simulate admin review
        await new Promise(r => setTimeout(r, 3000));

        console.log('2. Approving the appointment to trigger ICS calendar invite email...');
        const patchRes = await fetch(`${API_URL}/appointments/${appointment.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'APPROVED'
            })
        });

        if (!patchRes.ok) {
            console.error('Failed to approve!', await patchRes.text());
            return;
        }

        console.log('✅ Appointment Approved!');
        console.log('Check the inbox for michaelskydev@gmail.com!');

    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testFullBookingFlow();

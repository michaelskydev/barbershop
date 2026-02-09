
const API_URL = 'http://localhost:3000/api';

async function testBooking() {
    const payload = {
        customerName: "Test User",
        customerEmail: "test@example.com",
        customerPhone: "555-0000",
        startDate: new Date().toISOString(), // Use current time for testing
        barberId: 1,
        serviceId: 1
    };

    console.log('Sending payload:', payload);

    try {
        const res = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Data:', data);
    } catch (error) {
        console.error('Booking Failed:', error);
    }
}

testBooking();

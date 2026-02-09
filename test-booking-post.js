// No require needed for native fetch in Node 20+

async function testBooking() {
    const API_URL = 'http://localhost:3000/api';
    console.log('Testing booking POST...');

    try {
        const res = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                barberId: 1,
                serviceId: 1,
                startDate: new Date().toISOString(),
                customerName: "Test User",
                customerEmail: "test@example.com",
                customerPhone: "12345678"
            })
        });

        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Body:', data);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testBooking();

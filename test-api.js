
const API_URL = 'http://localhost:3000/api';

async function testApi() {
    try {
        console.log('Testing Barbers Endpoint...');
        const barbers = await fetch(`${API_URL}/barbers`).then(res => res.json());
        console.log(`Barbers found: ${barbers.length}`);
        if (barbers.length > 0) console.log(barbers[0]);

        console.log('\nTesting Services Endpoint...');
        const services = await fetch(`${API_URL}/services`).then(res => res.json());
        console.log(`Services found: ${services.length}`);
        if (services.length > 0) console.log(services[0]);

    } catch (error) {
        console.error('API Connection Failed:', error);
    }
}

testApi();

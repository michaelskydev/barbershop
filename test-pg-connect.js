const net = require('net');
const tls = require('tls');
require('dotenv').config();

const host = 'aws-1-us-east-2.pooler.supabase.com';

function testPort(port) {
    return new Promise((resolve) => {
        console.log(`\n--- Testing port ${port} ---`);
        
        // First test raw TCP
        const sock = new net.Socket();
        sock.setTimeout(5000);
        
        sock.on('connect', () => {
            console.log(`TCP connect on port ${port}: SUCCESS`);
            
            // Now try TLS upgrade
            const tlsSock = tls.connect({
                socket: sock,
                host: host,
                rejectUnauthorized: false,
                servername: host
            }, () => {
                console.log(`TLS handshake on port ${port}: SUCCESS`);
                console.log(`  Protocol: ${tlsSock.getProtocol()}`);
                console.log(`  Cipher: ${tlsSock.getCipher().name}`);
                tlsSock.destroy();
                resolve('tls-ok');
            });
            
            tlsSock.on('error', (err) => {
                console.log(`TLS handshake on port ${port}: FAILED - ${err.message}`);
                sock.destroy();
                resolve('tls-fail');
            });

            tlsSock.on('data', (data) => {
                console.log(`  Received data: ${data.toString('hex').substring(0, 100)}`);
            });
        });
        
        sock.on('timeout', () => {
            console.log(`TCP connect on port ${port}: TIMEOUT`);
            sock.destroy();
            resolve('timeout');
        });
        
        sock.on('error', (err) => {
            console.log(`TCP connect on port ${port}: ERROR - ${err.message}`);
            resolve('error');
        });
        
        sock.connect(port, host);
    });
}

async function main() {
    await testPort(6543);
    await testPort(5432);
    console.log('\nDone.');
}

main();

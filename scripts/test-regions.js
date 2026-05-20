const net = require('net');

const regions = [
    'eu-west-1',
    'eu-west-2',
    'eu-west-3',
    'eu-central-1',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ap-northeast-2',
    'ap-south-1'
];

const username = 'postgres.hxlfttvzraugmydgyspi';

function testRegion(region) {
    return new Promise((resolve) => {
        const host = `aws-0-${region}.pooler.supabase.com`;
        const port = 5432;
        
        console.log(`Probing region ${region} (${host}:${port})...`);
        const socket = net.connect(port, host);
        
        socket.setTimeout(3000);
        
        socket.on('connect', () => {
            const userKey = 'user\0';
            const userVal = username + '\0';
            const len = 8 + userKey.length + userVal.length + 1;
            
            const buffer = Buffer.alloc(len);
            buffer.writeInt32BE(len, 0);
            buffer.writeInt32BE(196608, 4); // Protocol version 3.0
            
            let pos = 8;
            buffer.write(userKey, pos);
            pos += userKey.length;
            buffer.write(userVal, pos);
            pos += userVal.length;
            buffer.write('\0', pos);
            
            socket.write(buffer);
        });
        
        socket.on('data', (data) => {
            const response = data.toString('utf8');
            if (response.includes('not found') || response.includes('ENOTFOUND')) {
                console.log(`❌ Region ${region}: Tenant not found.`);
                resolve(false);
            } else {
                console.log(`✅ Region ${region}: Success / Match! Response length:`, response.length);
                resolve(true);
            }
            socket.destroy();
        });
        
        socket.on('error', (err) => {
            console.log(`❌ Region ${region}: Error connecting - ${err.message}`);
            resolve(false);
        });
        
        socket.on('timeout', () => {
            console.log(`❌ Region ${region}: Timeout.`);
            socket.destroy();
            resolve(false);
        });
    });
}

async function run() {
    for (const region of regions) {
        const matched = await testRegion(region);
        if (matched) {
            console.log(`\n🎉 FOUND IT! The correct Supabase region is: ${region}`);
            break;
        }
    }
}

run();

const net = require('net');

const regions = [
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'ca-central-1',
    'sa-east-1',
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
        
        try {
            const socket = net.connect(port, host);
            socket.setTimeout(4000);
            
            socket.on('connect', () => {
                const userKey = 'user\0';
                const userVal = username + '\0';
                const len = 8 + userKey.length + userVal.length + 1;
                
                const buffer = Buffer.alloc(len);
                buffer.writeInt32BE(len, 0);
                buffer.writeInt32BE(196608, 4);
                
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
                socket.destroy();
                const lowercaseResponse = response.toLowerCase();
                if (lowercaseResponse.includes('not found') || lowercaseResponse.includes('enotfound') || lowercaseResponse.includes('tenant')) {
                    resolve({ region, success: false, error: 'Tenant not found' });
                } else {
                    resolve({ region, success: true, response });
                }
            });
            
            socket.on('error', (err) => {
                socket.destroy();
                resolve({ region, success: false, error: err.message });
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve({ region, success: false, error: 'Timeout' });
            });
        } catch (e) {
            resolve({ region, success: false, error: e.message });
        }
    });
}

async function run() {
    console.log('Starting concurrent region test for hxlfttvzraugmydgyspi...');
    
    const results = [];
    for (const r of regions) {
        testRegion(r).then(res => {
            console.log(`Region ${r} checked: ${res.success ? 'SUCCESS' : 'FAILED (' + res.error + ')'}`);
            results.push(res);
            if (results.length === regions.length) {
                console.log('\n--- Probing Results ---');
                for (const item of results) {
                    if (item.success) {
                        console.log(`\n🎉 MATCH FOUND: ${item.region}!`);
                        console.log('Response:', item.response.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim());
                    }
                }
                process.exit(0);
            }
        });
    }
}

run();

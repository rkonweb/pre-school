const https = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/little-chanakyas/parent/mobile/dashboard?preview=true',
    method: 'GET'
};

const req = https.request(options, (res: any) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk: any) => { data += chunk; });
    res.on('end', () => {
        console.log('BODY HEAD:', data.substring(0, 500));
    });
});

req.on('error', (e: any) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();

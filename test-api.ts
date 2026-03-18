import fetch from 'node-fetch';

async function testHomework() {
    console.log("Requesting OTP...");
    await fetch('http://localhost:3000/api/mobile/v1/parent/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '9779963940' })
    });

    console.log("Verifying OTP...");
    const vRes = await fetch('http://localhost:3000/api/mobile/v1/parent/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '9779963940', code: '123456' })
    });
    const vData = await vRes.json();
    console.log("Login User:", vData);

    const token = vData.token;
    const studentId = vData.data?.students[0]?.id;

    if (!token || !studentId) {
        console.error("Missing token or studentId");
        return;
    }

    console.log(`Fetching Homework for student: ${studentId}...`);
    const hwRes = await fetch(`http://localhost:3000/api/mobile/v1/parent/homework?studentId=${studentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`Status: ${hwRes.status}`);
    const hwData = await hwRes.json();
    console.log(JSON.stringify(hwData, null, 2));
}

testHomework().catch(console.error);

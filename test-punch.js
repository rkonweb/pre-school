const fs = require('fs');
const res = JSON.parse(fs.readFileSync('/tmp/login_res.json', 'utf-8'));
const token = res.data?.token;

if (!token) {
  console.log('No token found', res);
  process.exit(1);
}

fetch('http://localhost:3000/api/mobile/v1/staff/attendance/self', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    latitude: 13.0827,
    longitude: 80.2707,
    type: 'IN'
  })
})
.then(r => r.json())
.then(data => console.log('Punch Response:', data))
.catch(e => console.error(e));

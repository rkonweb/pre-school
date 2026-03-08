import fetch from 'node-fetch';

async function testSort() {
  const url = 'http://localhost:3000/s/littlechanakyas/students';
  
  // Try calling the RSC fetch endpoint or simply checking if the server is up
  const res = await fetch(url);
  console.log("Status:", res.status);
}

testSort();

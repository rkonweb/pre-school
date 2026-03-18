const { SignJWT } = require('jose');

async function test() {
  const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
  const token = await new SignJWT({ userId: "123", role: "PARENT" })
       .setProtectedHeader({ alg: "HS256" })
       .setIssuedAt()
       .setExpirationTime("30d")
       .sign(SECRET);

  console.log("Token:", token);
  const start = Date.now();
  try {
     const res = await fetch("http://127.0.0.1:3000/api/mobile/v1/parent/attendance?studentId=cm6aee7m50005dcr01rrcn0ro&month=3&year=2026", {
        headers: { "Authorization": "Bearer " + token }
     });
     console.log("Status:", res.status, "Time:", Date.now() - start + "ms");
     const text = await res.text();
     console.log("Body:", text);
  } catch(e) {
     console.log("Fetch error:", e.message);
  }
}
test();

import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123"
);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d") // Long session for mobile
        .sign(SECRET);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload && payload.role === "PARENT" && payload.sub && payload.sub.startsWith("parent_")) {
            (payload as any).phone = payload.sub.replace("parent_", "");
        }
        return payload;
    } catch (e) {
        return null;
    }
}

export async function getMobileAuth(req: Request) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];
    return await verifyToken(token);
}

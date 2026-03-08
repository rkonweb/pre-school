"use server";

import { prisma } from "@/lib/prisma";
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { GenerateRegistrationOptionsOpts, VerifyRegistrationResponseOpts } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const rpName = "Edu Portal Biometrics";
// SimpleWebAuthn requires rpID to match the domain exactly. We default to localhost for dev.
const rpID = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : "localhost";
const origin = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3000`;

export async function generateBiometricRegistrationOptions(staffId: string) {
    try {
        const staff = await prisma.user.findUnique({ where: { id: staffId }, include: { webAuthnCredentials: true } });
        if (!staff) throw new Error("Staff not found");

        const options: GenerateRegistrationOptionsOpts = {
            rpName,
            rpID,
            userID: new Uint8Array(Buffer.from(staffId)),
            userName: staff.email || staff.mobile || staff.firstName || "staff",
            // Require built-in authenticators or cross-platform (Yubikey)
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "preferred",
            },
            // Prevent registering the same device twice
            excludeCredentials: staff.webAuthnCredentials.map((cred: any) => ({
                id: cred.credentialID,
                type: "public-key",
            })),
        };

        const registrationOptions = await generateRegistrationOptions(options);

        // Store the challenge securely in an HttpOnly cookie for state verification
        const cookieStore = await cookies();
        cookieStore.set("webauthn_challenge", registrationOptions.challenge as string, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 5, // 5 minutes validity
            path: "/"
        });

        return { success: true, options: registrationOptions };
    } catch (error: any) {
        console.error("Error generating options:", error);
        return { success: false, error: error.message };
    }
}

export async function verifyBiometricRegistration(staffId: string, response: any, fingerName?: string) {
    try {
        const staff = await prisma.user.findUnique({ where: { id: staffId } });
        if (!staff) throw new Error("Staff not found");

        const cookieStore = await cookies();
        const storedChallenge = cookieStore.get("webauthn_challenge")?.value;

        if (!storedChallenge) {
             throw new Error("No active registration challenge found or it expired.");
        }

        const expectedChallenge = storedChallenge;

        const verification: VerifyRegistrationResponseOpts = {
            response: response as any,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        };

        const verificationResult = await verifyRegistrationResponse(verification);
        const { verified, registrationInfo } = verificationResult;

        if (verified && registrationInfo) {
            const { credential } = registrationInfo;
            const credentialPublicKey = credential.publicKey;
            const credentialID = credential.id;
            const counter = registrationInfo.credential.counter || 0;

            // Clear the challenge cookie
            const cookieStore = await cookies();
            cookieStore.delete("webauthn_challenge");

            // Store the credential
            await prisma.webAuthnCredential.create({
                data: {
                    credentialID: credentialID,
                    publicKey: Buffer.from(credentialPublicKey),
                    counter: BigInt(counter),
                    userId: staff.id,
                    fingerName: fingerName || null,
                    transports: registrationInfo.credential.transports ? JSON.stringify(registrationInfo.credential.transports) : null,
                }
            });

            return { success: true };
        }

        return { success: false, error: "Verification failed cryptographically" };
    } catch (error: any) {
        console.error("Error verifying registration:", error);
        return { success: false, error: error.message };
    }
}

export async function getStaffBiometrics(staffId: string) {
    try {
        const creds = await prisma.webAuthnCredential.findMany({
            where: { userId: staffId },
            orderBy: { createdAt: 'desc' }
        });
        
        return { 
            success: true, 
            credentials: creds.map(c => ({
                id: c.id,
                credentialID: c.credentialID,
                fingerName: c.fingerName,
                createdAt: c.createdAt,
            }))
        };
    } catch (error: any) {
         return { success: false, error: error.message };
    }
}

export async function removeBiometricCredential(credentialId: string, urlToRevalidate: string) {
     try {
         await prisma.webAuthnCredential.delete({ where: { id: credentialId }});
         revalidatePath(urlToRevalidate);
         return { success: true };
     } catch (error: any) {
         return { success: false, error: error.message };
     }
}

// ============================================================================
// AUTHENTICATION FLOW
// ============================================================================

export async function generateBiometricAuthenticationOptions(mobile: string) {
    try {
        const cleanMobile = mobile.replace(/\D/g, "");
        const mobilePossibilities = [
            mobile,
            cleanMobile,
            `+91${cleanMobile.slice(-10)}`,
            cleanMobile.slice(-10),
        ];

        const user = await prisma.user.findFirst({
            where: {
                mobile: { in: mobilePossibilities },
            },
            include: {
                webAuthnCredentials: true
            }
        });

        if (!user || (user.role !== "STAFF" && user.role !== "ADMIN")) {
            return { success: false, error: "Staff account not found" };
        }

        if (!user.webAuthnCredentials || user.webAuthnCredentials.length === 0) {
            return { success: false, error: "No biometric devices registered for this user." };
        }

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: user.webAuthnCredentials.map((cred: any) => ({
                id: cred.credentialID,
                type: "public-key",
                transports: cred.transports ? JSON.parse(cred.transports) : undefined,
            })),
            userVerification: "preferred",
        });

        const cookieStore = await cookies();
        cookieStore.set("webauthn_auth_challenge", options.challenge as string, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 5, // 5 minutes validity
            path: "/"
        });

        return { success: true, options };
    } catch (error: any) {
        console.error("Generate Auth Options Error:", error);
        return { success: false, error: error?.message || "Internal server error" };
    }
}

export async function verifyBiometricAuthentication(mobile: string, response: AuthenticationResponseJSON) {
    try {
        const cleanMobile = mobile.replace(/\D/g, "");
        const mobilePossibilities = [
            mobile,
            cleanMobile,
            `+91${cleanMobile.slice(-10)}`,
            cleanMobile.slice(-10),
        ];

        const user = await prisma.user.findFirst({
            where: {
                mobile: { in: mobilePossibilities },
            },
            include: {
                webAuthnCredentials: true
            }
        });

        if (!user || (user.role !== "STAFF" && user.role !== "ADMIN")) {
            return { success: false, error: "Staff account not found" };
        }

        const credential = user.webAuthnCredentials.find((c: any) => c.credentialID === response.id);

        if (!credential) {
            return { success: false, error: "Authenticator is not registered with this account." };
        }

        const cookieStore = await cookies();
        const storedChallenge = cookieStore.get("webauthn_auth_challenge")?.value;

        if (!storedChallenge) {
            return { success: false, error: "No active authentication challenge found or it expired." };
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: storedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: credential.credentialID,
                publicKey: new Uint8Array(credential.publicKey as Buffer),
                counter: Number(credential.counter),
                transports: credential.transports ? JSON.parse(credential.transports) : undefined,
            },
        });

        if (verification.verified && verification.authenticationInfo) {
            const newCounter = verification.authenticationInfo.newCounter;

            await prisma.webAuthnCredential.update({
                where: { id: credential.id },
                data: { counter: BigInt(newCounter) },
            });

            // Clear challenge
            cookieStore.delete("webauthn_auth_challenge");
            
            return { success: true };
        }

        return { success: false, error: "Fingerprint verification failed cryptographically." };
    } catch (error: any) {
        console.error("Verify Auth Error:", error);
        return { success: false, error: error?.message || "Internal server error" };
    }
}

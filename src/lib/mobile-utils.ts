/**
 * Normalize a mobile/phone to a consistent 10-digit format.
 * Strips country code, spaces, dashes, parens, etc.
 * Returns the last 10 digits of the number.
 */
export function normalizeMobile(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    return digits.slice(-10); // last 10 digits = Indian mobile
}

/**
 * All storage-format variants we check so no format inconsistency causes a miss.
 * e.g. "1111111111" → ["+91 1111111111", "+911111111111", "1111111111", ...]
 */
export function mobileVariants(phone: string): string[] {
    const last10 = normalizeMobile(phone);
    return Array.from(new Set([
        phone,
        last10,
        `+91${last10}`,
        `+91 ${last10}`,
        `91${last10}`,
        `0${last10}`,
    ]));
}

/**
 * Normalize an email address (trim + lowercase).
 */
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

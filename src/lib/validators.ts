/**
 * Global validation utilities — single source of truth for all forms.
 * Import from here instead of writing inline regex.
 */

/** Strip all non-digit characters from a phone string */
const digitsOnly = (v: string) => v.replace(/\D/g, "");

/**
 * Validate a phone number stored in PhoneInput format: "+CC XXXXXXXXXX"
 * The number part must be exactly 10 digits.
 * Returns an error string, or null if valid.
 */
export function validatePhone(value: string | null | undefined): string | null {
    if (!value || value.trim() === "") return null; // Required check is separate
    // Strip the country code prefix (e.g. "+91 ") — everything after the first space
    const parts = value.trim().split(" ");
    const number = parts.length >= 2 ? parts.slice(1).join("") : parts[0];
    const digits = number.replace(/\D/g, "");
    if (digits.length === 10) return null;
    return "Enter a valid 10-digit phone number";
}

/**
 * Validate an email address.
 * Returns an error string, or null if valid.
 */
export function validateEmail(value: string | null | undefined): string | null {
    if (!value || value.trim() === "") return null; // Required check is separate
    // RFC 5322-lite: must have local@domain.tld
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(value.trim())) return "Enter a valid email address";
    return null;
}

/**
 * Check if a field is empty (null, undefined, or blank string).
 */
export function isEmpty(value: any): boolean {
    return value === null || value === undefined || String(value).trim() === "";
}

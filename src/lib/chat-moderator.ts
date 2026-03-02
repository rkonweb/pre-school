/**
 * High-performance Chat Moderation Engine
 * Scans messages for policy violations like sharing Phone Numbers or Email Addresses.
 */

// Basic email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// Phone number regex (matches continuous 10 digits or common formatted like 123-456-7890)
const PHONE_REGEX = /(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\b\d{10}\b/;

// Basic Profanity Regex (Expandable list of offensive words)
// Using boundaries \b to prevent matching parts of acceptable words (e.g. 'ass' in 'class')
const PROFANITY_REGEX = /\b(fuck|shit|bitch|asshole|bastard|cunt|dick|pussy|slut|whore|crap|damn|moron|idiot|stupid|dumbass)\b/i;

export interface ModerationResult {
    isApproved: boolean;
    reason?: string;
}

export function moderateMessage(content: string): ModerationResult {
    if (!content) {
        return { isApproved: true };
    }

    // 1. Check for Emails
    if (EMAIL_REGEX.test(content)) {
        return {
            isApproved: false,
            reason: "Sharing Email Addresses is against School Communication Policy."
        };
    }

    // 2. Check for Phone Numbers
    // We strip out spaces to catch obfuscated numbers like "9 1 2 3 4 5 6 7 8 9"
    const strippedContent = content.replace(/\s+/g, '');
    if (PHONE_REGEX.test(strippedContent) || PHONE_REGEX.test(content)) {
        return {
            isApproved: false,
            reason: "Sharing Phone Numbers is against School Communication Policy."
        };
    }

    // 3. Check for Profanity / Abusive Language
    if (PROFANITY_REGEX.test(content)) {
        return {
            isApproved: false,
            reason: "Message blocked due to abusive or unparliamentary language."
        };
    }

    return { isApproved: true };
}

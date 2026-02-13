/**
 * Timezone-aware Date Utilities
 * Uses native Intl.DateTimeFormat for robust timezone handling without external dependencies.
 */

const TIMEZONE_MAP: Record<string, string> = {
    "UTC+5:30 (IST) - India Standard": "Asia/Kolkata",
    "UTC-8 (PST) - Pacific Time": "America/Los_Angeles",
    "UTC-5 (EST) - Eastern Time": "America/New_York",
    "UTC+0 (GMT) - Universal Time": "UTC",
    "UTC+1 (CET) - Central European": "Europe/Paris",
    "UTC+8 (SGT) - Singapore Time": "Asia/Singapore",
    "UTC+05:30 (India Standard Time)": "Asia/Kolkata",
    "UTC-05:00 (Eastern Standard Time)": "America/New_York",
};

export function normalizeTimezone(timezone: string): string {
    return TIMEZONE_MAP[timezone] || timezone || "Asia/Kolkata";
}

/**
 * Returns the current date and time adjusted to the target school's timezone.
 */
export function getSchoolNow(timezone: string = "Asia/Kolkata"): Date {
    const normalizedZone = normalizeTimezone(timezone);
    const now = new Date();
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: normalizedZone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        });

        const parts = formatter.formatToParts(now);
        const map: Record<string, string> = {};
        parts.forEach(p => map[p.type] = p.value);

        // Construct a Date object that reflects the time in that zone
        // Note: This Date object's UTC time will be wrong, but its local time components will be correct for that zone
        return new Date(
            parseInt(map.year),
            parseInt(map.month) - 1,
            parseInt(map.day),
            parseInt(map.hour),
            parseInt(map.minute),
            parseInt(map.second)
        );
    } catch (e) {
        console.error("Timezone invalid, falling back to system time:", timezone, "(normalized as:", normalizedZone, ")");
        return now;
    }
}

/**
 * Returns the current day (at 00:00:00) in the school's timezone.
 */
export function getSchoolToday(timezone: string = "Asia/Kolkata"): Date {
    const now = getSchoolNow(timezone);
    now.setHours(0, 0, 0, 0);
    return now;
}

/**
 * Formats a date string or object using the school's preferred format and timezone.
 */
export function formatInTimeZone(
    date: Date | string | number,
    timezone: string = "Asia/Kolkata",
    formatStr: string = "MM/DD/YYYY"
): string {
    const normalizedZone = normalizeTimezone(timezone);
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    try {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: normalizedZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(d);
        const map: Record<string, string> = {};
        parts.forEach(p => map[p.type] = p.value);

        const day = map.day;
        const month = map.month;
        const year = map.year;

        if (formatStr === "DD/MM/YYYY") return `${day}/${month}/${year}`;
        if (formatStr === "YYYY-MM-DD") return `${year}-${month}-${day}`;
        return `${month}/${day}/${year}`;

    } catch (e) {
        return d.toLocaleDateString();
    }
}

/**
 * Returns a human-readable time string in the school's timezone (e.g., "10:30 AM")
 */
export function getSchoolTime(
    date: Date | string | number = new Date(),
    timezone: string = "Asia/Kolkata"
): string {
    const normalizedZone = normalizeTimezone(timezone);
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    try {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: normalizedZone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(d);
    } catch (e) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

/**
 * Checks if a date string (YYYY-MM-DD) is in the future relative to the school's timezone.
 */
export function isSchoolFutureDate(dateStr: string, timezone: string = "Asia/Kolkata"): boolean {
    const schoolNow = getSchoolNow(timezone);
    const todayStr = `${schoolNow.getFullYear()}-${String(schoolNow.getMonth() + 1).padStart(2, '0')}-${String(schoolNow.getDate()).padStart(2, '0')}`;
    return dateStr > todayStr;
}

import { addDays, subDays, isWithinInterval } from "date-fns";

export interface Worksheet {
    id: string;
    title: string;
    category: string;
    theme: string;
    scheduled_date: Date;
    access_window_days: number; // default 15
    file_url: string; // Private bucket path
}

export interface InstructionalSteps {
    introduction: string;
    core_instruction: string;
    reinforcement: string;
    revision: string;
}

export interface LessonPlan {
    id: string;
    day_number: number;
    theme: string;
    scheduled_date: Date;
    preparation_notes: string;
    materials_required: string[];
    instructional_steps: InstructionalSteps;
    learning_outcomes: string;
    observation_points: string[];
    worksheet_ids: string[];
}

export interface WorksheetUsage {
    id: string;
    worksheetId: string;
    schoolId: string;
    printCount: number;
    lastUsed: Date;
    overrideEnabled: boolean;
}

/**
 * Server-side function to check if a worksheet is available for a school.
 */
export async function checkWorksheetAvailability(
    worksheet: Worksheet,
    schoolId: string,
    overrides: WorksheetUsage[] = []
): Promise<boolean> {
    const now = new Date();

    // Check for Super Admin Override
    const usage = overrides.find(o => o.worksheetId === worksheet.id && o.schoolId === schoolId);
    if (usage?.overrideEnabled) {
        return true;
    }

    // logic: current_date is within scheduled_date +/- 7 days (total 15 days window)
    const windowStart = subDays(worksheet.scheduled_date, 7);
    const windowEnd = addDays(worksheet.scheduled_date, 7);

    return isWithinInterval(now, { start: windowStart, end: windowEnd });
}

/**
 * Mocks generating a signed URL for a private bucket resource.
 */
export async function getSignedUrl(filePath: string): Promise<string> {
    // In a real implementation, this would call S3/Supabase/GCS to get a signed URL
    // valid for 60 seconds.
    return `${filePath}?token=short_lived_60_sec_token_${Math.random().toString(36).substr(2, 9)}`;
}

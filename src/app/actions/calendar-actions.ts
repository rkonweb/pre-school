"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Get Calendar Settings ──────────────────────────────────────────────────

export async function getCalendarSettingsAction(slug: string) {
  try {
    const school = await prisma.school.findUnique({
      where: { slug },
      select: {
        id: true,
        schoolTimings: true,
        workingDays: true,
        academicYearStartMonth: true,
        schoolHolidays: { orderBy: { date: "asc" } },
        calendarNotes: { orderBy: { date: "asc" } },
        calendarDayStatuses: { orderBy: { date: "asc" } },
      },
    });
    if (!school) return { success: false, error: "School not found" };
    return {
      success: true,
      data: {
        schoolTimings: school.schoolTimings || "9:00 AM - 3:00 PM",
        workingDays: school.workingDays || '["MON","TUE","WED","THU","FRI"]',
        academicYearStartMonth: school.academicYearStartMonth ?? 4,
        holidays: school.schoolHolidays,
        notes: school.calendarNotes,
        dayStatuses: school.calendarDayStatuses,
      },
    };
  } catch (error) {
    console.error("getCalendarSettingsAction error:", error);
    return { success: false, error: "Failed to fetch calendar settings" };
  }
}

// ─── Update School Timings ──────────────────────────────────────────────────

export async function updateSchoolTimingsAction(slug: string, timings: string) {
  try {
    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) return { success: false, error: "School not found" };
    await prisma.school.update({ where: { slug }, data: { schoolTimings: timings } });
    revalidatePath(`/s/${slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update timings" };
  }
}

// ─── Update Working Days ────────────────────────────────────────────────────

export async function updateWorkingDaysAction(slug: string, workingDays: string[]) {
  try {
    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) return { success: false, error: "School not found" };
    await prisma.school.update({ where: { slug }, data: { workingDays: JSON.stringify(workingDays) } });
    revalidatePath(`/s/${slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update working days" };
  }
}

// ─── Add Holiday ────────────────────────────────────────────────────────────

export async function addHolidayAction(
  slug: string,
  data: { name: string; date: string; type: string; recurring: boolean; isHoliday?: boolean; isAISuggested?: boolean; notes?: string }
) {
  try {
    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) return { success: false, error: "School not found" };
    await prisma.schoolHoliday.create({
      data: {
        name: data.name, date: new Date(data.date), type: data.type, recurring: data.recurring,
        isHoliday: data.isHoliday ?? true, isAISuggested: data.isAISuggested ?? false,
        notes: data.notes || null, schoolId: school.id,
      },
    });
    revalidatePath(`/s/${slug}`);
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") return { success: false, error: "A holiday already exists on this date" };
    return { success: false, error: "Failed to add holiday" };
  }
}

// ─── Update Holiday ─────────────────────────────────────────────────────────

export async function updateHolidayAction(
  slug: string, holidayId: string,
  data: { isHoliday?: boolean; notes?: string; name?: string; type?: string }
) {
  try {
    await prisma.schoolHoliday.update({
      where: { id: holidayId },
      data: {
        ...(data.isHoliday !== undefined && { isHoliday: data.isHoliday }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
      },
    });
    revalidatePath(`/s/${slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update holiday" };
  }
}

// ─── Delete Holiday ─────────────────────────────────────────────────────────

export async function deleteHolidayAction(slug: string, holidayId: string) {
  try {
    await prisma.schoolHoliday.delete({ where: { id: holidayId } });
    revalidatePath(`/s/${slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete holiday" };
  }
}

// ─── Toggle Day Status (WORKING -> HALFDAY -> HOLIDAY -> WORKING) ───────────

export async function toggleDayStatusAction(slug: string, date: string, status: string) {
  try {
    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) return { success: false, error: "School not found" };
    const dateObj = new Date(date);
    await prisma.calendarDayStatus.upsert({
      where: { schoolId_date: { schoolId: school.id, date: dateObj } },
      create: { date: dateObj, status, schoolId: school.id },
      update: { status },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update day status" };
  }
}

// ─── Bulk Toggle Day-of-Week (e.g. all Saturdays in a month) ────────────────

export async function bulkToggleDayOfWeekAction(
  slug: string,
  dayOfWeek: number, // 0=Sun, 1=Mon, ..., 6=Sat
  month: number,
  year: number,
  status: string
) {
  try {
    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) return { success: false, error: "School not found" };

    const daysInMonth = new Date(year, month, 0).getDate();
    let updated = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month - 1, d);
      if (dt.getDay() === dayOfWeek) {
        await prisma.calendarDayStatus.upsert({
          where: { schoolId_date: { schoolId: school.id, date: dt } },
          create: { date: dt, status, schoolId: school.id },
          update: { status },
        });
        updated++;
      }
    }

    return { success: true, updated };
  } catch (error) {
    return { success: false, error: "Failed to bulk update" };
  }
}

// ─── Save/Update Calendar Note with Reminder ────────────────────────────────

export async function saveCalendarNoteAction(
  slug: string,
  data: { id?: string; date: string; title?: string; note: string; color?: string; reminder?: boolean; reminderDaysBefore?: number; reminderType?: string }
) {
  try {
    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) return { success: false, error: "School not found" };
    const dateObj = new Date(data.date);
    if (data.id) {
      // Update existing note
      await prisma.calendarNote.update({
        where: { id: data.id },
        data: {
          title: data.title || "", note: data.note, color: data.color || "#6366F1",
          reminder: data.reminder ?? false, reminderDaysBefore: data.reminderDaysBefore ?? 1,
          reminderType: data.reminderType || "NOTIFICATION", reminderSent: false,
        },
      });
    } else {
      // Create new note
      await prisma.calendarNote.create({
        data: {
          date: dateObj, title: data.title || "", note: data.note, color: data.color || "#6366F1",
          reminder: data.reminder ?? false, reminderDaysBefore: data.reminderDaysBefore ?? 1,
          reminderType: data.reminderType || "NOTIFICATION", schoolId: school.id,
        },
      });
    }
    revalidatePath(`/s/${slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save note" };
  }
}

// ─── Delete Calendar Note ───────────────────────────────────────────────────

export async function deleteCalendarNoteAction(slug: string, noteId: string) {
  try {
    await prisma.calendarNote.delete({ where: { id: noteId } });
    revalidatePath(`/s/${slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete note" };
  }
}

// ─── Bulk Add Holidays ──────────────────────────────────────────────────────

export async function bulkAddHolidaysAction(
  slug: string, items: { name: string; date: string; type: string }[]
) {
  try {
    const school = await prisma.school.findUnique({ where: { slug } });
    if (!school) return { success: false, error: "School not found" };
    let added = 0, skipped = 0;
    for (const item of items) {
      try {
        await prisma.schoolHoliday.create({
          data: { name: item.name, date: new Date(item.date), type: item.type, recurring: false, isHoliday: true, isAISuggested: true, schoolId: school.id },
        });
        added++;
      } catch (err: any) {
        if (err?.code === "P2002") skipped++; else throw err;
      }
    }
    revalidatePath(`/s/${slug}`);
    return { success: true, added, skipped };
  } catch (error) {
    return { success: false, error: "Failed to add holidays" };
  }
}

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Reads the global header's academic year cookie and returns the selected academic year ID.
 * Fallback chain: cookie → isCurrent flag → latest year by startDate.
 */
export async function getSelectedAcademicYearId(slug: string, schoolId: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(`academic_year_${slug}`)?.value;

  if (cookieId) {
    // Verify the cookie value is a valid academic year for this school
    const exists = await prisma.academicYear.findFirst({
      where: { id: cookieId, schoolId },
      select: { id: true },
    });
    if (exists) return exists.id;
  }

  // Fallback: find current academic year
  const current = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
    select: { id: true },
  });
  if (current) return current.id;

  // Fallback: latest year
  const latest = await prisma.academicYear.findFirst({
    where: { schoolId },
    select: { id: true },
    orderBy: { startDate: "desc" },
  });
  return latest?.id;
}

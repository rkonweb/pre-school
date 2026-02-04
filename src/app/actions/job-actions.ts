"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import { join } from "path";


export async function getJobDetailsAction(id: string) {
    try {
        const job = await prisma.jobPosting.findUnique({
            where: { id }
        });
        return job;
    } catch (error) {
        console.error("Error fetching job:", error);
        return null;
    }
}

export async function submitJobApplicationAction(formData: FormData) {
    try {
        const jobId = formData.get("jobId") as string;
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const linkedin = formData.get("linkedin") as string;
        const portfolio = formData.get("portfolio") as string;
        const resumeFile = formData.get("resume") as File;

        if (!jobId || !firstName || !lastName || !email || !resumeFile) {
            return { success: false, error: "Missing required fields" };
        }

        // Handle File Upload
        let resumeUrl = "";
        if (resumeFile.size > 0) {
            const bytes = await resumeFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const filename = `${Date.now()}-${resumeFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const uploadDir = join(process.cwd(), "public", "uploads", "resumes");

            // Ensure directory exists (fs/promises doesn't have mkdir -p equivalent easily without try/catch or simple generic mkdir)
            // We'll rely on a separate helper or just try writing
            // Ideally we should check/create the dir. 
            // For simplicity in this agent environment, I will try to write content.

            // I'll assume the folder might not exist, so let's import fs
            const fs = require('fs');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const path = join(uploadDir, filename);
            await writeFile(path, buffer);
            resumeUrl = `/uploads/resumes/${filename}`;
        }

        // Save to DB
        await prisma.jobApplication.create({
            data: {
                jobId,
                firstName,
                lastName,
                email,
                phone,
                linkedin,
                portfolio,
                resumeUrl
            }
        });

        revalidatePath("/admin/cms/careers");
        return { success: true };

    } catch (error) {
        console.error("Error submitting application:", error);
        return { success: false, error: "Failed to submit application" };
    }
}

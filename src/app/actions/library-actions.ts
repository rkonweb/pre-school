"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { validateUserSchoolAction } from "./session-actions";

// --- Book Management ---

export async function createBookAction(data: any, schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        await prisma.libraryBook.create({
            data: {
                title: data.title,
                author: data.author,
                isbn: data.isbn,
                publisher: data.publisher,
                category: data.category,
                copies: Number(data.copies),
                shelfNo: data.shelfNo,
                schoolId: schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/library/inventory`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateBookAction(slug: string, bookId: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await prisma.libraryBook.update({
            where: { id: bookId },
            data: {
                title: data.title,
                author: data.author,
                isbn: data.isbn,
                publisher: data.publisher,
                category: data.category,
                copies: Number(data.copies),
                shelfNo: data.shelfNo,
            }
        });

        revalidatePath(`/s/${slug}/library/inventory`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteBookAction(slug: string, bookId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        await prisma.libraryBook.delete({ where: { id: bookId } });
        revalidatePath(`/s/${slug}/library/inventory`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBooksAction(
    schoolSlug: string,
    query: string = "",
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    category: string = ""
) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };
        const whereClause: any = {
            school: { slug: schoolSlug },
            OR: [
                { title: { contains: query } },
                { author: { contains: query } },
                { isbn: { contains: query } }
            ]
        };

        if (category && category !== "All") {
            whereClause.category = category;
        }

        const orderByClause: any = {};
        if (sortBy === "available") {
            // Sorting by computed field 'available' is tricky in Prisma direct query without raw SQL or aggregation sorting.
            // For simplicity and stability, we'll sort by 'copies' or 'createdAt' if 'available' is requested, 
            // OR we sort in memory after fetching (if dataset is small).
            // Let's fallback to 'copies' for now or handle in memory if strictly required.
            // A better approach for big data is to keep 'available' as a field in DB or use raw query.
            // Given the constraints, let's sort by 'copies' if 'available' is picked, or default to creation.
            // Actually, let's handle 'available' post-fetch for accuracy if needed, but let's stick to direct DB sorts for standard fields.
            orderByClause.copies = sortOrder;
        } else {
            // Handle relation counts or standard fields
            if (sortBy === "title" || sortBy === "author" || sortBy === "copies" || sortBy === "category" || sortBy === "createdAt") {
                orderByClause[sortBy] = sortOrder;
            } else {
                orderByClause.createdAt = "desc";
            }
        }

        const books = await prisma.libraryBook.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { transactions: { where: { status: "ISSUED" } } }
                }
            },
            orderBy: orderByClause
        });

        // Calculate available copies
        let data = books.map(book => ({
            ...book,
            available: book.copies - book._count.transactions
        }));

        // In-memory sort for 'available' if requested
        if (sortBy === "available") {
            data.sort((a, b) => {
                if (sortOrder === "asc") return a.available - b.available;
                return b.available - a.available;
            });
        }

        // Extract unique categories for filter dropdown
        // This is a lightweight way to get categories without a separate query
        const categories = await prisma.libraryBook.findMany({
            where: { school: { slug: schoolSlug }, category: { not: null } },
            select: { category: true },
            distinct: ['category']
        });
        const uniqueCategories = categories.map(c => c.category).filter(Boolean) as string[];

        return { success: true, data, categories: uniqueCategories };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Circulation (Issue/Return) ---

export async function issueBookAction(data: { bookId: string, studentId?: string, staffId?: string, dueDate: Date }, schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        // Check availability
        const book = await prisma.libraryBook.findUnique({
            where: { id: data.bookId },
            include: { _count: { select: { transactions: { where: { status: "ISSUED" } } } } }
        });

        if (!book) throw new Error("Book not found");
        if ((book.copies - book._count.transactions) <= 0) {
            throw new Error("No copies available");
        }

        // Create Transaction
        await prisma.libraryTransaction.create({
            data: {
                bookId: data.bookId,
                studentId: data.studentId,
                staffId: data.staffId,
                dueDate: data.dueDate,
                status: "ISSUED",
                schoolId: schoolId
            }
        });

        revalidatePath(`/s/${schoolSlug}/library`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function returnBookAction(slug: string, transactionId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const transaction = await prisma.libraryTransaction.findUnique({
            where: { id: transactionId },
            include: { school: { include: { librarySettings: true } } }
        });

        if (!transaction) throw new Error("Transaction not found");

        const returnDate = new Date();
        let fine = 0;

        // Calculate Fine
        if (returnDate > transaction.dueDate) {
            const diffTime = Math.abs(returnDate.getTime() - transaction.dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const finePerDay = transaction.school.librarySettings?.finePerDay || 10;
            fine = diffDays * finePerDay;
        }

        await prisma.libraryTransaction.update({
            where: { id: transactionId },
            data: {
                status: "RETURNED",
                returnedDate: returnDate,
                fineAmount: fine
            }
        });

        revalidatePath(`/s/${slug}/library`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getLibraryStatsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        const totalBooks = await prisma.libraryBook.aggregate({
            where: { schoolId: schoolId },
            _sum: { copies: true }
        });

        const issuedBooks = await prisma.libraryTransaction.count({
            where: { schoolId: schoolId, status: "ISSUED" }
        });

        const overdueBooks = await prisma.libraryTransaction.count({
            where: {
                schoolId: schoolId,
                status: "ISSUED",
                dueDate: { lt: new Date() }
            }
        });

        const recentTransactions = await prisma.libraryTransaction.findMany({
            where: { schoolId: schoolId },
            include: {
                book: true,
                student: true,
                staff: true
            },
            orderBy: { issuedDate: 'desc' },
            take: 10
        });

        return {
            success: true,
            data: {
                totalBooks: totalBooks._sum.copies || 0,
                issuedBooks,
                overdueBooks,
                recentTransactions
            }
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTransactionsAction(schoolSlug: string, filter: "ALL" | "ISSUED" | "RETURNED" | "OVERDUE" = "ALL") {
    try {
        const whereClause: any = { school: { slug: schoolSlug } };

        if (filter === "ISSUED") whereClause.status = "ISSUED";
        if (filter === "RETURNED") whereClause.status = "RETURNED";
        if (filter === "OVERDUE") {
            whereClause.status = "ISSUED";
            whereClause.dueDate = { lt: new Date() };
        }

        const transactions = await prisma.libraryTransaction.findMany({
            where: whereClause,
            include: {
                book: true,
                student: true,
                staff: true
            },
            orderBy: { issuedDate: 'desc' },
            take: 50 // Limit for now
        });

        return { success: true, data: transactions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentLibraryHistoryAction(slug: string, studentId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const transactions = await prisma.libraryTransaction.findMany({
            where: { studentId },
            include: { book: true },
            orderBy: { issuedDate: 'desc' }
        });
        return { success: true, data: transactions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStaffLibraryHistoryAction(slug: string, staffId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const transactions = await prisma.libraryTransaction.findMany({
            where: { staffId },
            include: { book: true },
            orderBy: { issuedDate: 'desc' }
        });
        return { success: true, data: transactions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateBookCoverAction(schoolSlug: string, bookId: string, formData: FormData) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const file = formData.get("file") as File;
        if (!file || file.size === 0) {
            return { success: false, error: "No file provided" };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `book-cover-${bookId}-${Date.now()}-${safeName}`;
        const uploadDir = join(process.cwd(), "public/uploads/library");

        await mkdir(uploadDir, { recursive: true });

        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        const coverUrl = `/uploads/library/${filename}`;

        await prisma.libraryBook.update({
            where: { id: bookId },
            data: { coverUrl }
        });

        revalidatePath(`/s/${schoolSlug}/library/inventory`);
        return { success: true, coverUrl };
    } catch (error: any) {
        console.error("Cover Upload Error:", error);
        return { success: false, error: error.message };
    }
}

export async function bulkCreateBooksAction(schoolSlug: string, booksData: any[]) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        if (!Array.isArray(booksData) || booksData.length === 0) {
            return { success: false, error: "No valid data provided" };
        }

        // Validate and format data
        const formattedBooks = booksData.map(book => ({
            title: book.title || "Untitled",
            author: book.author || "Unknown",
            isbn: book.isbn || null,
            category: book.category || "General",
            copies: parseInt(book.copies) || 1,
            shelfNo: book.shelfNo || null,
            schoolId: schoolId
        }));

        const result = await prisma.libraryBook.createMany({
            data: formattedBooks
        });

        revalidatePath(`/s/${schoolSlug}/library/inventory`);
        return { success: true, count: result.count };

    } catch (error: any) {
        console.error("Bulk Upload Error:", error);
        return { success: false, error: error.message };
    }
}

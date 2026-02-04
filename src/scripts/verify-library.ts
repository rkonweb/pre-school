
import { prisma } from "@/lib/prisma";
import { createBookAction, issueBookAction, returnBookAction, getLibraryStatsAction, getTransactionsAction } from "@/app/actions/library-actions";

async function verifyLibraryModule() {
    console.log("Starting Library Module Verification...");
    const schoolSlug = "pre-school"; // Assuming this exists from context

    // 1. Setup Data
    console.log("\n1. creating test book...");
    const bookData = {
        title: "Test Book " + Date.now(),
        author: "Verification Bot",
        isbn: "TEST-" + Date.now(),
        copies: 5,
        shelfNo: "A1"
    };

    let bookId = "";
    try {
        // We need to fetch school first to get ID for createBook internally, but action handles slug.
        // Actually createBookAction takes data and schoolSlug.
        const res = await createBookAction(bookData, schoolSlug);
        if (!res.success) throw new Error("Failed to create book: " + res.error);

        // Get the book ID
        const book = await prisma.libraryBook.findFirst({ where: { isbn: bookData.isbn } });
        if (!book) throw new Error("Book created but not found in DB");
        bookId = book.id;
        console.log("✅ Book Created:", book.title, "(ID:", bookId, ")");
    } catch (e: any) {
        console.error("❌ Step 1 Failed:", e.message);
        return;
    }

    // 2. Issue Book
    console.log("\n2. Issuing book...");
    let transactionId = "";
    try {
        // Need a student or staff. Let's find one.
        const student = await prisma.student.findFirst();
        if (!student) {
            console.warn("⚠️ No students found. Skipping Issue Test (Logic requires a borrower).");
        } else {
            console.log("   Borrower:", student.firstName, student.lastName);
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // 7 days from now

            const res = await issueBookAction({
                bookId: bookId,
                studentId: student.id,
                dueDate: dueDate
            }, schoolSlug);

            if (!res.success) throw new Error("Failed to issue book: " + res.error);
            console.log("✅ Book Issued Successfully");

            // Verify Stock Reduction
            const bookAfter = await prisma.libraryBook.findUnique({
                where: { id: bookId },
                include: { _count: { select: { transactions: { where: { status: "ISSUED" } } } } }
            });
            const available = bookAfter!.copies - bookAfter!._count.transactions;
            console.log("   Stock Checked: Available =", available, "(Expected 4)");
            if (available !== 4) console.error("❌ Stock count incorrect!");

            // Get Transaction ID
            const tx = await prisma.libraryTransaction.findFirst({
                where: { bookId, studentId: student.id, status: "ISSUED" },
                orderBy: { issuedDate: 'desc' }
            });
            if (tx) transactionId = tx.id;
        }
    } catch (e: any) {
        console.error("❌ Step 2 Failed:", e.message);
    }

    // 3. Transactions & History
    console.log("\n3. Verifying Transactions List...");
    try {
        const stats = await getLibraryStatsAction(schoolSlug);
        console.log("   Dashboard Stats:", JSON.stringify(stats.data));
        if (stats.data.issuedBooks < 1) console.error("❌ Stats 'Issued Books' seems low (expected at least 1)");
        else console.log("✅ Stats verified");
    } catch (e: any) {
        console.error("❌ Step 3 Failed:", e.message);
    }

    // 4. Return Book
    if (transactionId) {
        console.log("\n4. Returning Book...");
        try {
            const res = await returnBookAction(transactionId, schoolSlug);
            if (!res.success) throw new Error("Failed to return book: " + res.error);
            console.log("✅ Book Returned Successfully");

            const tx = await prisma.libraryTransaction.findUnique({ where: { id: transactionId } });
            console.log("   Transaction Status:", tx?.status);
            console.log("   Fine Amount:", tx?.fineAmount);

            // Verify Stock Replenishment
            const bookAfter = await prisma.libraryBook.findUnique({
                where: { id: bookId },
                include: { _count: { select: { transactions: { where: { status: "ISSUED" } } } } }
            });
            const available = bookAfter!.copies - bookAfter!._count.transactions;
            console.log("   Stock Checked: Available =", available, "(Expected 5)");
            if (available !== 5) console.error("❌ Stock count incorrect!");

        } catch (e: any) {
            console.error("❌ Step 4 Failed:", e.message);
        }
    }

    // 5. Cleanup
    console.log("\n5. Cleanup...");
    await prisma.libraryBook.delete({ where: { id: bookId } });
    console.log("✅ Test Book Deleted");

    console.log("\nVerification Complete.");
}

verifyLibraryModule()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

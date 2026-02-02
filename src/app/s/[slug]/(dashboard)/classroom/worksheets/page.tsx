"use client";

import { useState, useRef } from "react";
import { Printer, Lock, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintProtection } from "@/components/curriculum/PrintProtection";

interface Worksheet {
    id: string;
    title: string;
    category: string;
    scheduled_date: string;
    isAvailable: boolean;
    preview_url: string; // Thumbnails for preview, not the full PDF
}

const MOCK_WORKSHEETS: Worksheet[] = [
    { id: "W1", title: "Trace the Alphabet: A-E", category: "Literacy", scheduled_date: "2026-01-24", isAvailable: true, preview_url: "https://placehold.co/400x600/f8faff/4f46e5?text=Alphabet+Trace" },
    { id: "W2", title: "Counting Shapes (1-10)", category: "Numeracy", scheduled_date: "2026-01-24", isAvailable: true, preview_url: "https://placehold.co/400x600/f8faff/4f46e5?text=Shape+Count" },
    { id: "W3", title: "Color the Ocean Animals", category: "Creative", scheduled_date: "2026-01-28", isAvailable: false, preview_url: "https://placehold.co/400x600/f8faff/4f46e5?text=Ocean+Coloring" },
];

export default function TeacherWorksheetsPage() {
    const [printing, setPrinting] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleSecurePrint = async (worksheet: Worksheet) => {
        if (printing) return;
        setPrinting(worksheet.id);

        try {
            // 1. Fetch Signed URL from Server (Mocked)
            // const { url } = await fetch(`/api/curriculum/sign?file=${worksheet.id}`).then(res => res.json());
            // const signedUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"; // Mock PDF

            // 2. Fetch PDF as Blob via Secured logic (Using Base64 to avoid CORS in demo)
            const base64Pdf = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgNTk1LjI4IDg0MS44OSBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCDIgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjUwIDc1MCBUZAovRjEgMjQgVGYKKEJyaWdodCBCZWdpbm5pbmdzIFdvcmtzaGVldCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAgCjAwMDAwMDAxNTcgMDAwMDAgbiAgCjAwMDAwMDAyNzAgMDAwMDAgbiAgCjAwMDAwMDAzNTggMDAwMDAgbiAgCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ1MwolJUVPRgo=";
            const response = await fetch(`data:application/pdf;base64,${base64Pdf}`);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // 3. Prepare Iframe for printing
            if (iframeRef.current) {
                const iframe = iframeRef.current;
                const doc = iframe.contentDocument || iframe.contentWindow?.document;

                if (doc) {
                    doc.open();
                    doc.write(`
            <html>
              <head>
                <style>
                  @media print {
                    body { margin: 0; padding: 0; }
                    img, iframe, embed { width: 100vw; height: 100vh; object-fit: contain; }
                  }
                  /* Hide from screen, only for print */
                  body { visibility: hidden; }
                  .print-content { visibility: visible; }
                </style>
              </head>
              <body>
                <embed src="${blobUrl}" type="application/pdf" width="100%" height="100%" class="print-content" />
                <script>
                   // Trigger print immediately after load
                   window.onload = function() {
                     window.focus();
                     window.print();
                   }
                </script>
              </body>
            </html>
          `);
                    doc.close();

                    // Wait for print dialog to close (imperfect, but best we can do without specific events)
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                        // document.execCommand('ClearAuthenticationCache'); // Clearing cache if supported
                        setPrinting(null);
                        if (iframe.contentWindow) {
                            iframe.contentWindow.document.body.innerHTML = "";
                        }
                    }, 2000);
                }
            }
        } catch (error) {
            console.error("Print failed:", error);
            setPrinting(null);
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PrintProtection />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Daily Worksheets</h2>
                    <p className="text-zinc-500">Securely print classroom materials for your students.</p>
                </div>
                <div className="flex h-10 items-center gap-2 rounded-xl bg-green-50 px-4 text-xs font-bold text-green-600 dark:bg-green-950/30">
                    <CheckCircle2 className="h-4 w-4" />
                    School ID: BRIGHT-B-01 (Authorized)
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_WORKSHEETS.map((worksheet) => (
                    <div
                        key={worksheet.id}
                        className={cn(
                            "group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950",
                            !worksheet.isAvailable && "opacity-75 grayscale"
                        )}
                    >
                        {/* Preview Area (Low-Res/Watermarked preview) */}
                        <div className="aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                            <img src={worksheet.preview_url} alt={worksheet.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/20 p-4">
                                <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-widest">
                                    {worksheet.category}
                                </span>
                            </div>

                            {!worksheet.isAvailable && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white">
                                    <Lock className="mb-2 h-8 w-8" />
                                    <p className="text-sm font-bold">Locked until {worksheet.scheduled_date}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{worksheet.title}</h3>
                            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 font-medium">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {worksheet.scheduled_date}
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    PDF Document
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => handleSecurePrint(worksheet)}
                                    disabled={!worksheet.isAvailable || printing === worksheet.id}
                                    className={cn(
                                        "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all active:scale-95",
                                        worksheet.isAvailable
                                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                            : "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
                                    )}
                                >
                                    {printing === worksheet.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <Printer className="h-4 w-4" />
                                    )}
                                    {printing === worksheet.id ? "Processing Security..." : "Secure Print"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hidden Iframe for Printing */}
            <iframe
                ref={iframeRef}
                style={{ display: "none" }}
                title="Secure Print Iframe"
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Lock, Printer, X as IconX } from "lucide-react";
import { motion } from "framer-motion";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { toast } from 'sonner';

// Configure worker (using version from pdfjs-dist 4.x)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePdfViewerProps {
    file: { name: string; url: string };
    onClose: () => void;
}

export default function SecurePdfViewer({ file, onClose }: SecurePdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [isPrinting, setIsPrinting] = useState(false);
    const [renderedPageCount, setRenderedPageCount] = useState(0);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    const handlePrint = () => {
        if (isPrinting) return;
        setIsPrinting(true);
        setRenderedPageCount(0);
        toast.info("Preparing secure print version...");
    };

    useEffect(() => {
        if (isPrinting && numPages > 0 && renderedPageCount >= numPages) {
            // Give a small buffer for the final canvas paint to complete visually
            const timer = setTimeout(() => {
                window.print();
                // We keep isPrinting true for a moment or reset? 
                // Resetting immediately after print dialog opens is usually fine.
                // But some browsers might clear the DOM if we reset too fast.
                // Let's reset after a delay.
                setTimeout(() => setIsPrinting(false), 1000);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [renderedPageCount, isPrinting, numPages]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8 select-none"
            onContextMenu={(e) => e.preventDefault()}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-zinc-900 w-full h-full max-w-4xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-zinc-800 print:hidden"
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm text-zinc-100">{file.name}</h3>
                            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Protected • No Download</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-2 mr-4">
                            <button
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                className="p-1 px-2 text-zinc-400 hover:text-white disabled:opacity-30"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-mono text-zinc-400">{pageNumber} / {numPages || '-'}</span>
                            <button
                                disabled={pageNumber >= numPages}
                                onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                                className="p-1 px-2 text-zinc-400 hover:text-white disabled:opacity-30"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="h-10 w-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-emerald-500 transition-all disabled:opacity-50"
                            title="Print Securely"
                        >
                            {isPrinting ? <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full" /> : <Printer className="h-5 w-5" />}
                        </button>

                        <button
                            onClick={onClose}
                            className="h-10 w-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-all"
                        >
                            <IconX className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-zinc-950 relative overflow-auto flex justify-center p-8">
                    <div className="relative shadow-2xl">
                        <Document
                            file={file.url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="max-w-full"
                            loading={<div className="text-zinc-500 text-sm animate-pulse">Decrypting secure document...</div>}
                            error={<div className="text-red-500 text-sm">Failed to load secure document.</div>}
                        >
                            <Page
                                pageNumber={pageNumber}
                                width={800}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                error={<div className="text-red-500 text-sm">Page error.</div>}
                            />
                        </Document>

                        {/* Security Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                            <div className="transform -rotate-45 text-4xl font-black text-black select-none border-4 border-black p-4 uppercase tracking-widest">
                                Do Not Copy
                            </div>
                        </div>
                        {/* Invisible Blocking Layer */}
                        <div className="absolute inset-0 z-50 mix-blend-multiply opacity-0" />
                    </div>
                </div>
            </motion.div>

            {/* Print Container */}
            {isPrinting && (
                <div
                    id="secure-print-container"
                    className="fixed top-0 left-0 w-full h-full bg-white z-[99999] opacity-0 print:opacity-100 print:fixed print:inset-0 print:bg-white"
                >
                    <Document
                        file={file.url}
                        onLoadError={(error) => {
                            toast.error("Failed to prepare print document.");
                            setIsPrinting(false);
                            console.error(error);
                        }}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <div key={`print_page_${index + 1}`} className="relative w-full h-auto page-break-after-always">
                                <Page
                                    pageNumber={index + 1}
                                    width={790}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    onRenderSuccess={() => setRenderedPageCount(prev => prev + 1)}
                                    onRenderError={() => setRenderedPageCount(prev => prev + 1)}
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page { margin: 10mm; size: auto; }
                    body { 
                        background: white; 
                    }
                    
                    /* Hide everything by default using visibility to avoid layout shifts/parent hiding issues */
                    body * {
                        visibility: hidden;
                    }

                    /* Only show our print container and its children */
                    #secure-print-container,
                    #secure-print-container * {
                        visibility: visible;
                    }

                    #secure-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    
                    /* Ensure page breaks work */
                    .page-break-after-always { 
                        page-break-after: always;
                        break-after: page;
                        display: block;
                        margin-bottom: 20px; 
                    }
                    
                    /* Hide modal specifically if it tries to show up */
                    .no-print { display: none !important; }
                }
            `}</style>
        </motion.div>
    );
}

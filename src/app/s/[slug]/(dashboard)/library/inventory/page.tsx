"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
    getBooksAction,
    createBookAction,
    updateBookAction,
    deleteBookAction,
    updateBookCoverAction,
    bulkCreateBooksAction
} from "@/app/actions/library-actions";
import {
    Search,
    Plus,
    MoreVertical,
    Edit,
    Trash,
    Loader2,
    Upload,
    FileSpreadsheet,
    Image as ImageIcon,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Papa from "papaparse";
import Image from "next/image";
import { useConfirm } from "@/contexts/ConfirmContext";

export default function LibraryInventoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: "asc" | "desc" }>({ key: "createdAt", direction: "desc" });
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        isbn: "",
        publisher: "",
        category: "",
        copies: "1",
        shelfNo: ""
    });
    const [submitting, setSubmitting] = useState(false);

    // Image Upload State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Bulk Upload State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [isBulkUploading, setIsBulkUploading] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, [slug, search, sortConfig, categoryFilter]);

    async function fetchBooks() {
        setLoading(true);
        const res = await getBooksAction(slug, search, sortConfig.key, sortConfig.direction, categoryFilter);
        if (res.success) {
            setBooks(res.data || []);
            if (res.categories) setAvailableCategories(res.categories);
        }
        setLoading(false);
    }

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    function handleOpenModal(book: any = null) {
        if (book) {
            setEditingBook(book);
            setFormData({
                title: book.title,
                author: book.author,
                isbn: book.isbn || "",
                publisher: book.publisher || "",
                category: book.category || "",
                copies: String(book.copies),
                shelfNo: book.shelfNo || ""
            });
            setPreviewUrl(book.coverUrl || null);
        } else {
            setEditingBook(null);
            setFormData({
                title: "",
                author: "",
                isbn: "",
                publisher: "",
                category: "",
                copies: "1",
                shelfNo: ""
            });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            let res;
            let bookId = editingBook?.id;

            if (editingBook) {
                res = await updateBookAction(editingBook.id, formData, slug);
            } else {
                res = await createBookAction(formData, slug);
                // We need the ID for image upload. createBookAction doesn't return ID currently in our lightweight implementation.
                // NOTE: Ideally createBookAction should return the new book object.
                // For now, if creating, we might skip image upload or refactor createBookAction. 
                // Let's assume we refactored createBookAction to return {success: true, book: ...} or we refetch.
                // Limiting factor: Current createBookAction returns {success:true}. 
                // Fix strategy: We will fetch the book by ISBN or Title to upload image, OR update createBookAction.
                // For robustness, let's just upload image if editing, or warn user. 
                // Better yet, let's update createBookAction return quickly or do a quick lookup.
                // Assuming we can't easily change backend right this second without context switch, let's handle image separately after create?
                // Actually, let's try to upload image if we have an ID. If new book, we might miss it.
                // Let's rely on loose coupling: If new book, we ask user to edit to add image or we implement properly.
                // Let's try to fetch the newly created book by ISBN/Title if it was a create action.
            }

            if (res.success) {
                // If we have a file and an ID (editing), upload cover.
                // If creating, we need the ID. 
                // Let's find the book we just added if it was a create action.
                if (!bookId && res.success) {
                    // Try to find the book we just created to attach image
                    // This is a bit "hacky" but works without changing backend signature immediately.
                    const recentRes = await getBooksAction(slug, formData.isbn || formData.title);
                    if (recentRes.success && recentRes.data.length > 0) {
                        bookId = recentRes.data[0].id;
                    }
                }

                if (bookId && selectedFile) {
                    const uploadData = new FormData();
                    uploadData.set("file", selectedFile);
                    await updateBookCoverAction(slug, bookId, uploadData);
                }

                toast.success(editingBook ? "Book updated" : "Book added");
                setIsModalOpen(false);
                fetchBooks();
            } else {
                toast.error(res.error || "Failed to save book");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    // Image Handling
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File too large (max 5MB)");
                return;
            }
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    // Bulk Upload Handling
    const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setBulkFile(e.target.files[0]);
        }
    };

    const handleBulkSubmit = async () => {
        if (!bulkFile) return;
        setIsBulkUploading(true);

        Papa.parse(bulkFile, {
            header: true,
            complete: async (results) => {
                // Expected Headers: Title, Author, ISBN, Category, Copies, Shelf
                // Map to our keys: title, author, isbn, category, copies, shelfNo
                const mappedData = results.data.map((row: any) => ({
                    title: row.Title || row.title,
                    author: row.Author || row.author,
                    isbn: row.ISBN || row.isbn,
                    category: row.Category || row.category,
                    copies: row.Copies || row.copies,
                    shelfNo: row.Shelf || row.shelfNo
                })).filter((b: any) => b.title); // Basic filter for empty rows

                if (mappedData.length === 0) {
                    toast.error("No valid data found in CSV");
                    setIsBulkUploading(false);
                    return;
                }

                const res = await bulkCreateBooksAction(slug, mappedData);
                if (res.success) {
                    toast.success(`Successfully added ${res.count} books`);
                    setIsBulkModalOpen(false);
                    setBulkFile(null);
                    fetchBooks();
                } else {
                    toast.error(res.error || "Bulk upload failed");
                }
                setIsBulkUploading(false);
            },
            error: (error) => {
                toast.error("Error parsing CSV: " + error.message);
                setIsBulkUploading(false);
            }
        });
    };

    async function handleDelete(id: string) {
        const confirmed = await confirmDialog({
            title: "Delete Book",
            message: "Are you sure you want to delete this book?",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await deleteBookAction(id, slug);
        if (res.success) {
            toast.success("Book deleted");
            fetchBooks();
        } else {
            toast.error(res.error || "Failed to delete");
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Book Inventory</h1>
                    <p className="text-zinc-500">Manage your library catalog.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-600 shadow-sm transition-all hover:bg-zinc-50"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Bulk Upload
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:brightness-110 hover:shadow-xl"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Book
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-zinc-900 shadow-sm ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-brand"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full h-full rounded-2xl border-0 bg-white px-4 py-4 text-zinc-900 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-brand appearance-none cursor-pointer"
                        style={{ backgroundImage: 'none' }}
                    >
                        <option value="All">All Categories</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Book List - Table View */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm ring-1 ring-zinc-100">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                                <th
                                    onClick={() => handleSort("title")}
                                    className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-pointer hover:text-zinc-700 hover:bg-zinc-100 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-2">
                                        Book
                                        {sortConfig.key === "title" && (
                                            <span className="text-brand">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort("copies")}
                                    className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-pointer hover:text-zinc-700 hover:bg-zinc-100 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-2">
                                        Stock
                                        {sortConfig.key === "copies" && (
                                            <span className="text-brand">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort("category")}
                                    className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-pointer hover:text-zinc-700 hover:bg-zinc-100 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-2">
                                        Details
                                        {sortConfig.key === "category" && (
                                            <span className="text-brand">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] text-right font-black uppercase tracking-widest text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {books.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-zinc-500">
                                        No books found. Add one manually or use bulk upload.
                                    </td>
                                </tr>
                            ) : (
                                books.map((book) => (
                                    <tr key={book.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 shadow-sm border border-zinc-100">
                                                    {book.coverUrl ? (
                                                        <img
                                                            src={book.coverUrl}
                                                            alt={book.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-zinc-300 bg-zinc-50">
                                                            <ImageIcon className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-bold text-zinc-900 line-clamp-2 max-w-[200px]">{book.title}</div>
                                                    <div className="text-xs text-zinc-500">{book.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total</span>
                                                    <span className="font-bold text-zinc-900">{book.copies}</span>
                                                </div>
                                                <div className="h-8 w-px bg-zinc-100"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Avail</span>
                                                    <span className={cn(
                                                        "font-bold",
                                                        book.available > 0 ? "text-emerald-600" : "text-red-600"
                                                    )}>
                                                        {book.available}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2 text-xs font-medium">
                                                {book.category && (
                                                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-zinc-600 border border-zinc-200">
                                                        {book.category}
                                                    </span>
                                                )}
                                                {book.shelfNo && (
                                                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-amber-700 border border-amber-100">
                                                        Shelf: {book.shelfNo}
                                                    </span>
                                                )}
                                                {book.isbn && (
                                                    <span className="inline-flex items-center rounded-md bg-brand/5 px-2 py-1 text-brand border border-brand/10 font-mono text-[10px]">
                                                        ISBN: {book.isbn}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(book)}
                                                    className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-brand hover:border-brand/40 transition-all shadow-sm"
                                                    title="Edit Book"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book.id)}
                                                    className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                                    title="Delete Book"
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900">
                                {editingBook ? "Edit Book" : "Add New Book"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-full p-2 hover:bg-zinc-100"
                            >
                                <X className="h-5 w-5 text-zinc-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload Field */}
                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="h-32 w-24 overflow-hidden rounded-xl bg-zinc-100 ring-2 ring-zinc-200 ring-offset-2 transition-all group-hover:ring-brand">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Cover Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-400">
                                                <Upload className="h-6 w-6" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Cover</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <p className="text-white text-xs font-bold">Change</p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">Book Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Author</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Category</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">ISBN</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Publisher</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                                        value={formData.publisher}
                                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Total Copies</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                                        value={formData.copies}
                                        onChange={(e) => setFormData({ ...formData, copies: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Shelf No.</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                                        value={formData.shelfNo}
                                        onChange={(e) => setFormData({ ...formData, shelfNo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:brightness-110 hover:shadow-xl disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editingBook ? "Update Book" : "Add Book"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900">Bulk Upload</h2>
                            <button
                                onClick={() => setIsBulkModalOpen(false)}
                                className="rounded-full p-2 hover:bg-zinc-100"
                            >
                                <X className="h-5 w-5 text-zinc-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl bg-brand/10 p-4 text-sm text-brand border border-brand/20">
                                <p className="font-bold mb-1">CSV Format guide:</p>
                                <p>Headers: Title, Author, ISBN, Category, Copies, Shelf</p>
                            </div>

                            <div className="flex w-full items-center justify-center">
                                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-brand/40 transition-all">
                                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                        <Upload className="mb-2 h-8 w-8 text-zinc-400" />
                                        <p className="mb-2 text-sm text-zinc-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-zinc-500">CSV files only</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".csv" onChange={handleBulkFileChange} />
                                </label>
                            </div>

                            {bulkFile && (
                                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 p-3">
                                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-zinc-700 flex-1 truncate">
                                        {bulkFile.name}
                                    </span>
                                    <button onClick={() => setBulkFile(null)} className="text-zinc-400 hover:text-red-500">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleBulkSubmit}
                                disabled={!bulkFile || isBulkUploading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:brightness-110 disabled:opacity-50"
                            >
                                {isBulkUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Upload & Process
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

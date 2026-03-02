import Link from "next/link";
import { Store, Receipt, FileText, ArrowRight } from "lucide-react";

const QUICK_LINKS = [
    {
        title: "Purchase Orders",
        description: "Raise POs, track admin approvals, and record goods receipts",
        icon: Receipt,
        href: (slug: string) => `/s/${slug}/vendor/purchase-orders`,
        color: "bg-teal-50 text-teal-600",
        border: "border-teal-100",
    },
    {
        title: "Quotations (RFQs)",
        description: "Review vendor RFQs, quotes, and pricing documents",
        icon: FileText,
        href: (slug: string) => `/s/${slug}/vendor/quotations`,
        color: "bg-sky-50 text-sky-600",
        border: "border-sky-100",
    },
];

export default function VendorDashboard({ params }: { params: { slug: string } }) {
    const slug = params.slug;

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Oversee supplier relationships, purchase orders, and quotes.
                </p>
            </div>

            {/* Quick Links */}
            <div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href(slug)}
                            className={`group flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ${link.border} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                        >
                            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl md:mb-2 ${link.color}`}>
                                <link.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 text-lg group-hover:text-brand transition-colors">{link.title}</p>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{link.description}</p>
                            </div>
                            <div className="mt-auto pt-4 flex justify-end">
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-brand transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

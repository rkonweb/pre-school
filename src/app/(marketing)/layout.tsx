import { MarketingFooter, MarketingHeader } from "@/components/marketing/MarketingShell";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            <MarketingHeader />
            <main className="flex-1 flex flex-col">
                {children}
            </main>
            <MarketingFooter />
        </div>
    );
}

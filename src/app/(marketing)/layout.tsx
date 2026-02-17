import { Header } from "@/components/figma/Header";
import { Footer } from "@/components/figma/Footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans">
            <Header />
            <div className="flex-1">
                {children}
            </div>
            <Footer />
        </div>
    );
}

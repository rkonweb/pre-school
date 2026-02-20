import { cn } from "@/lib/utils";

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
    return (
        <div
            className={cn("flex flex-col min-h-screen bg-[#F1F5F9] pb-24", className)}
            {...props}
        >
            {children}
        </div>
    );
}

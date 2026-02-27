import { DashboardLoader } from "@/components/ui/DashboardLoader";

export default function Loading() {
    return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <DashboardLoader message="Loading dashboard..." />
        </div>
    );
}

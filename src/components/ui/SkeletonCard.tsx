import { cn } from "@/lib/utils";

/** Single animated shimmer block */
export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800",
                className
            )}
        />
    );
}

/** Full tab skeleton — 4 stat cards + a large content card */
export function TabSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stat row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-6 space-y-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-7 w-12" />
                    </div>
                ))}
            </div>
            {/* Main card */}
            <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl p-8 space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
                <div className="grid grid-cols-7 gap-2 mt-6">
                    {[...Array(35)].map((_, i) => (
                        <Skeleton key={i} className="h-[80px] rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Profile tab skeleton */
export function ProfileSkeleton() {
    return (
        <div className="grid lg:grid-cols-12 gap-10 pb-28 animate-in fade-in duration-300">
            <div className="lg:col-span-8 space-y-10">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 mt-4">
                            {[...Array(4)].map((_, j) => (
                                <div key={j} className="space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="lg:col-span-4 space-y-10">
                <div className="bg-zinc-900 rounded-[40px] p-10 space-y-6">
                    <Skeleton className="h-5 w-28 bg-zinc-700" />
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-2xl bg-zinc-800" />
                    ))}
                </div>
                <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl space-y-4">
                    <Skeleton className="h-5 w-24" />
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Fees tab skeleton */
export function FeesSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="px-8 py-6 border-b border-zinc-50 flex items-center gap-6">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-20 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Reports tab skeleton */
export function ReportsSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-6 rounded-3xl border border-zinc-100 bg-zinc-50 space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

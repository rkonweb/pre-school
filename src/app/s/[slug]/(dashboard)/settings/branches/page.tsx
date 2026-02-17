import { BranchList } from "@/components/dashboard/settings/BranchList";
import { getBranchesAction } from "@/app/actions/branch-actions";
import { validateUserSchoolAction } from "@/app/actions/session-actions";
import { redirect } from "next/navigation";

export default async function BranchSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const auth = await validateUserSchoolAction(slug);
    if (!auth.success || !auth.user) {
        redirect("/school-login");
    }

    if (auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN") {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    const { data: branches, error } = await getBranchesAction(slug);

    if (error || !branches) {
        return <div className="p-8 text-center text-red-500">Failed to load branches: {error}</div>;
    }

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Branch Management
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage your school's physical branches and locations.
                    </p>
                </div>

                <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="text-sm font-medium">
                        <span className="text-muted-foreground">Branch Limit:</span>
                        <span className="ml-2 text-xl font-bold">
                            {branches.length} / {auth.user.school?.maxBranches ?? 1}
                        </span>
                    </div>
                </div>
            </div>

            <BranchList branches={branches} slug={slug} />
        </div>
    );
}

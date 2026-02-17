"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { switchBranchAction } from "@/app/actions/session-actions";
import { toast } from "sonner"; // Assuming sonner is used, or console.error if not available
// If sonner is not available, I'll remove it or use a simple alert/console. 
// I'll check package.json later but for now I'll skip toast or use console.

interface Branch {
    id: string;
    name: string;
}

interface BranchSelectorProps {
    branches: Branch[];
    currentBranchId: string;
    isCollapsed: boolean;
}

export function BranchSelector({ branches, currentBranchId, isCollapsed }: BranchSelectorProps) {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();
    const [value, setValue] = React.useState(currentBranchId);

    // Update local state if prop changes (e.g. initial load)
    React.useEffect(() => {
        setValue(currentBranchId);
    }, [currentBranchId]);

    const onSelect = (branchId: string) => {
        setValue(branchId);
        startTransition(async () => {
            try {
                const res = await switchBranchAction(branchId);
                if (res.success) {
                    router.refresh();
                } else {
                    console.error("Failed to switch branch:", res.error);
                    // Revert on failure
                    setValue(currentBranchId);
                }
            } catch (error) {
                console.error("Error switching branch:", error);
                setValue(currentBranchId);
            }
        });
    };

    if (branches.length === 0) return null;

    if (isCollapsed) {
        return (
            <div className="flex justify-center p-2 mb-2">
                <div className="h-9 w-9 flex items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500" title="Switch Branch">
                    <Building2 className="h-4 w-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="px-3 mb-2">
            <Select value={value} onValueChange={onSelect} disabled={isPending}>
                <SelectTrigger className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-brand/20">
                    <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-4 w-4 text-zinc-500" />
                        <SelectValue placeholder="Select Branch" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                            <span className="truncate">{branch.name}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

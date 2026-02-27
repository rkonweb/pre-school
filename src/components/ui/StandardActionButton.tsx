"use client";

import React from "react";
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import Link from "next/link";

export type ActionButtonVariant = 'primary' | 'secondary' | 'view' | 'edit' | 'delete' | 'success' | 'warning' | 'ghost' | 'outline';

interface StandardActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: LucideIcon;
    loading?: boolean;
    variant?: ActionButtonVariant;
    label?: string;
    iconOnly?: boolean;
    tooltip?: string;
    permission?: {
        module: string;
        action: string;
    };
    // asChild support: if provided, renders children (e.g. Link) wrapping the button content
    asChild?: boolean;
    href?: string;
    size?: string;
}

export const StandardActionButton = React.forwardRef<HTMLButtonElement, StandardActionButtonProps>(
    ({
        icon: Icon,
        loading = false,
        variant = 'primary',
        label,
        iconOnly = false,
        tooltip,
        permission,
        className,
        children,
        disabled,
        asChild,
        href,
        ...props
    }, ref) => {
        const { can, isLoading: isPermsLoading } = useRolePermissions();

        const hasPermission = permission
            ? can(permission.module, permission.action)
            : true;

        if (!hasPermission && !isPermsLoading) return null;

        const isIconButton = iconOnly || (Icon && !label);

        const getVariantClasses = (): string => {
            const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-all select-none";
            const iconCircle = "h-8 w-8 rounded-full p-0";
            const labelBase = "h-9 px-4 rounded-xl text-sm font-medium";

            switch (variant) {
                case 'primary':
                    return cn(base,
                        "h-11 px-5 bg-brand text-[var(--secondary-color)] rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] hover:brightness-110 active:scale-95 border-none disabled:opacity-50"
                    );
                case 'secondary':
                    return cn(base,
                        "h-11 px-5 bg-zinc-100 text-zinc-700 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
                    );
                case 'view':
                    return cn(base,
                        isIconButton ? iconCircle : labelBase,
                        "bg-white border border-brand/40 text-brand hover:bg-brand/5 hover:scale-110 active:scale-95 shadow-sm"
                    );
                case 'edit':
                    return cn(base,
                        isIconButton ? iconCircle : labelBase,
                        "bg-white border border-amber-300 text-amber-600 hover:bg-amber-50 hover:scale-110 active:scale-95 shadow-sm"
                    );
                case 'delete':
                    return cn(base,
                        isIconButton ? iconCircle : labelBase,
                        "bg-white border border-red-300 text-red-600 hover:bg-red-50 hover:scale-110 active:scale-95 shadow-sm"
                    );
                case 'success':
                    return cn(base, "p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-95");
                case 'warning':
                    return cn(base, "p-2 rounded-lg text-orange-600 hover:bg-orange-50 active:scale-95");
                case 'ghost':
                    return cn(base, "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50");
                case 'outline':
                    return cn(base, labelBase, "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-brand hover:border-brand/40 shadow-sm");
                default:
                    return base;
            }
        };

        const content = (
            <>
                {loading
                    ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    : Icon && <Icon className="h-4 w-4 shrink-0" />
                }
                {!iconOnly && label && <span>{label}</span>}
            </>
        );

        const combinedClassName = cn(getVariantClasses(), className);

        // If asChild is used with a Link child, wrap content inside the Link
        if (asChild && React.isValidElement(children)) {
            const child = children as React.ReactElement<any>;
            // It's a Link/anchor — clone it with our button styles
            return React.cloneElement(child, {
                className: cn(combinedClassName, child.props.className),
                title: tooltip || label,
            }, content);
        }

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={combinedClassName}
                title={tooltip || label}
                {...props}
            >
                {content}
                {!iconOnly && !label && children}
            </button>
        );
    }
);

StandardActionButton.displayName = "StandardActionButton";

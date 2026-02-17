"use client";

import React from "react";
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRolePermissions } from "@/hooks/useRolePermissions";

export type ActionButtonVariant = 'primary' | 'view' | 'edit' | 'delete' | 'success' | 'warning' | 'ghost' | 'outline';

interface StandardActionButtonProps extends Omit<ButtonProps, 'variant'> {
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
        ...props
    }, ref) => {
        const { can, isLoading: isPermsLoading } = useRolePermissions();

        const hasPermission = permission
            ? can(permission.module, permission.action)
            : true;

        if (!hasPermission && !isPermsLoading) return null;

        const getVariantClasses = () => {
            const baseCircle = "h-8 w-8 rounded-full flex items-center justify-center p-0";
            const baseLabel = "h-9 px-4 rounded-xl text-sm font-medium flex items-center gap-2";

            switch (variant) {
                case 'primary':
                    return "h-11 px-6 bg-brand text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all border-none flex items-center justify-center";
                case 'view':
                    return cn(
                        isIconButton ? baseCircle : baseLabel,
                        "bg-white border border-brand/40 text-brand hover:bg-brand/5 hover:scale-110 active:scale-95 transition-all shadow-sm"
                    );
                case 'edit':
                    return cn(
                        isIconButton ? baseCircle : baseLabel,
                        "bg-white border border-amber-300 text-amber-600 hover:bg-amber-50 hover:scale-110 active:scale-95 transition-all shadow-sm"
                    );
                case 'delete':
                    return cn(
                        isIconButton ? baseCircle : baseLabel,
                        "bg-white border border-red-300 text-red-600 hover:bg-red-50 hover:scale-110 active:scale-95 transition-all shadow-sm"
                    );
                case 'success':
                    return "p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2";
                case 'warning':
                    return "p-2 rounded-lg text-orange-600 hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-2";
                case 'ghost':
                    return "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-all flex items-center gap-2";
                case 'outline':
                    return "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-brand hover:border-brand/40 transition-all px-4 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-2";
                default:
                    return "";
            }
        };

        const childHasContent = props.asChild
            ? React.isValidElement(children) && !!(children.props as any).children
            : !!children;
        const isIconButton = iconOnly || (Icon && !label && !childHasContent);

        const renderContent = (innerChildren?: React.ReactNode) => (
            <>
                {loading ? (
                    <Loader2 className={cn("h-4 w-4 animate-spin", !isIconButton && "mr-2")} />
                ) : (
                    Icon && <Icon className={cn("h-4 w-4", !isIconButton && "mr-2")} />
                )}
                {!iconOnly && (label || innerChildren)}
            </>
        );

        if (props.asChild && React.isValidElement(children)) {
            return (
                <Button
                    ref={ref}
                    disabled={disabled || loading}
                    className={cn(
                        getVariantClasses(),
                        isIconButton && "p-0 flex items-center justify-center",
                        className
                    )}
                    title={tooltip || label}
                    asChild
                    {...props}
                >
                    {React.cloneElement(children as React.ReactElement, {}, renderContent((children.props as any).children))}
                </Button>
            );
        }

        return (
            <Button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    getVariantClasses(),
                    isIconButton && "p-0 flex items-center justify-center",
                    className
                )}
                title={tooltip || label}
                {...props}
            >
                {renderContent(children)}
            </Button>
        );
    }
);

StandardActionButton.displayName = "StandardActionButton";

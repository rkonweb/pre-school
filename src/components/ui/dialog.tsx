"use client"
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const C = {
    navy: "#1E1B4B", g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g400: "#9CA3AF", g500: "#6B7280", amber: "#F59E0B",
    shL: "0 16px 48px rgba(0,0,0,0.18)",
};

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn("fixed inset-0 z-50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", className)}
        style={{
            background: "rgba(30,27,75,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
        }}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn("fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]", className)}
            style={{
                background: "white",
                borderRadius: 24,
                padding: 32,
                boxShadow: C.shL,
                animation: "scaleIn 0.3s ease",
                ...style,
            }}
            {...props}
        >
            {children}
            <DialogPrimitive.Close
                style={{
                    position: "absolute",
                    top: 16, right: 16,
                    width: 30, height: 30,
                    borderRadius: 8,
                    border: `1.5px solid ${C.g200}`,
                    background: C.g50,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FFFBEB"; (e.currentTarget as HTMLElement).style.borderColor = "#F59E0B"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.g50; (e.currentTarget as HTMLElement).style.borderColor = C.g200; }}
            >
                <X size={14} color={C.g500} />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 mb-5", className)} style={style} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)} style={{ gap: 10, ...style }} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, style, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(className)}
        style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, color: C.navy, letterSpacing: -0.3, ...style }}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, style, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn(className)}
        style={{ fontSize: 13, color: C.g400, marginTop: 3, ...style }}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger,
    DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
};

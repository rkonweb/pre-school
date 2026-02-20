import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface StandardCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
}

export function StandardCard({ children, className, ...props }: StandardCardProps) {
    return (
        <motion.div
            className={cn(
                "bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}

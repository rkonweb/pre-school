"use client";

import { motion } from "framer-motion";

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

const variants = {
    hidden: { opacity: 0, x: 20 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export default function PageTransition({ children, className }: PageTransitionProps) {
    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="enter"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getCurrencySymbol(code: string | null | undefined) {
    if (!code) return "$";
    const symbols: Record<string, string> = {
        "USD": "$",
        "INR": "₹",
        "EUR": "€",
        "GBP": "£"
    };
    return symbols[code] || "$";
}

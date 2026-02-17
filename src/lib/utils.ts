import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(currency: string) {
  switch (currency?.toUpperCase()) {
    case "INR": return "₹";
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    default: return currency || "$";
  }
}

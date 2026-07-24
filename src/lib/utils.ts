import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number (or Prisma Decimal-as-number) as Indian Rupees. */
export function formatCurrency(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

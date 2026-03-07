import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind class names conditionally.
 * Combines `clsx` (conditional classes) with `tailwind-merge`
 * (conflict resolution — e.g. `p-2 p-4` → `p-4`).
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-accent", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

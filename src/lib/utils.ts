import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for generating class names conditionally
 * @param inputs Array of class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatuje datę do czytelnego formatu
 * @param date Data do sformatowania
 * @returns Sformatowana data
 */
export function formatDate(date: string | Date): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Utility function to check if a string is a valid UUID
 * @param str String to check
 * @returns true if the string is a valid UUID, false otherwise
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Utility function to format time in seconds to a readable string (MM:SS)
 * @param seconds Number of seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

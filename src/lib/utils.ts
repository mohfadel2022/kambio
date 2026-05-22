import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Deeply serializes data from Prisma to be passed to Client Components.
 * Converts Decimals to Numbers and Dates to ISO strings.
 */
export function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data)) as T;
}

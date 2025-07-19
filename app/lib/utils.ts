import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// formatSize: converts bytes to a human-readable string
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  let size = bytes;
  do {
    size = size / 1024;
    i++;
  } while (size >= 1024 && i < units.length - 1);
  // If size is an integer, don't show decimal point
  const rounded = Math.round(size * 10) / 10;
  if (Number.isInteger(rounded)) {
    return `${rounded} ${units[i]}`;
  }
  return `${rounded.toFixed(1)} ${units[i]}`;
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

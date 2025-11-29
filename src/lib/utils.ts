import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const bannedWords = ["maldición", "grosería"];

export function profanityFree(text: string) {
  return !bannedWords.some((w) => text.toLowerCase().includes(w));
}

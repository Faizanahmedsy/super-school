import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function to conditionally combine and merge Tailwind CSS class names.
 *
 * This function takes in any number of class names or conditional class expressions
 * (via the `clsx` library), processes them to remove any falsy or invalid values,
 * and then merges conflicting Tailwind classes using `tailwind-merge` for proper
 * resolution of class conflicts.
 *
 * @param {...ClassValue[]} inputs - A list of class names or conditional class expressions
 * (e.g., strings, objects, arrays). Falsy values like `false`, `undefined`, or `null` are
 * ignored, ensuring that only valid class names are included.
 *
 * @returns {string} - A single string containing all the valid, merged class names.
 *
 * @example
 * // Basic usage:
 * cn('bg-red-500', 'text-white', 'px-4');
 * // Returns: "bg-red-500 text-white px-4"
 *
 * @example
 * // Conditional classes with clsx:
 * cn('bg-red-500', isActive && 'text-white', isDisabled && 'opacity-50');
 * // Returns (if isActive = true, isDisabled = false): "bg-red-500 text-white"
 *
 * @example
 * // Merging conflicting Tailwind classes:
 * cn('px-4', 'px-8', 'sm:px-4');
 * // Returns: "px-8 sm:px-4"
 * // `twMerge` ensures that the last conflicting class wins ("px-8" over "px-4"),
 * // while preserving responsive variants ("sm:px-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

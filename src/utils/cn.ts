type ClassValue = string | string[] | undefined | null | false | 0

/**
 * Lightweight classname merger — no external deps.
 * Accepts strings, string arrays, and falsy values.
 */
export const cn = (...inputs: ClassValue[]): string =>
  inputs
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .filter(Boolean)
    .join(' ')

/**
 * Generate a RFC 4122 UUID using the browser's crypto API.
 * Falls back to a random hex string if crypto.randomUUID is unavailable.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback: 16-byte random hex
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

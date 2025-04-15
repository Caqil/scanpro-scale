// lib/sanitize-input.ts
import DOMPurify from 'dompurify'; // For browser-like sanitization
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('');
const purify = DOMPurify(window);

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Basic cleanup: trim and remove control characters
  let cleaned = input
    .trim()
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control chars
    .replace(/\s+/g, ' '); // Normalize whitespace

  // Use DOMPurify to remove XSS risks
  cleaned = purify.sanitize(cleaned, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });

  // Additional checks for length
  if (cleaned.length > 5000) {
    cleaned = cleaned.substring(0, 5000); // Enforce max length
  }

  return cleaned;
}
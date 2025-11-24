// Frontend sanitization utility for XSS prevention
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Raw HTML string
 * @returns {string} - Sanitized HTML string
 */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * Sanitize plain text (remove all HTML)
 * @param {string} text - Raw text that may contain HTML
 * @returns {string} - Plain text with no HTML
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Escape HTML entities for display
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for display
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate and sanitize user input
 * @param {string} input - User input
 * @param {number} maxLength - Maximum allowed length
 * @returns {object} - { valid: boolean, value: string, error: string }
 */
export function validateInput(input, maxLength = 255) {
  if (!input || typeof input !== 'string') {
    return { valid: false, value: '', error: 'Input is required' };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, value: '', error: 'Input cannot be empty' };
  }

  if (trimmed.length > maxLength) {
    return { 
      valid: false, 
      value: trimmed.substring(0, maxLength), 
      error: `Input is too long (max ${maxLength} characters)` 
    };
  }

  // Sanitize the input
  const sanitized = sanitizeText(trimmed);

  return { valid: true, value: sanitized, error: null };
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {object} - { valid: boolean, error: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (trimmed.length > 255) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true, error: null };
}

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {object} - { valid: boolean, error: string, strength: string }
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required', strength: 'none' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long', strength: 'weak' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)', strength: 'none' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (criteriaCount < 3) {
    return { 
      valid: false, 
      error: 'Password must contain at least 3 of: uppercase, lowercase, number, special character',
      strength: 'weak' 
    };
  }

  let strength = 'medium';
  if (password.length >= 12 && criteriaCount === 4) {
    strength = 'strong';
  }

  return { valid: true, error: null, strength };
}

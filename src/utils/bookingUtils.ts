/**
 * Utility functions for booking reference generation
 */

/**
 * Generate a unique booking reference code
 * Format: ESC-YYYYMMDD-XXXX (where XXXX is a random alphanumeric string)
 */
export function generateBookingReference(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  // Increase random part length to 6 chars and include milliseconds to ensure uniqueness in loops
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const ms = now.getMilliseconds().toString().padStart(3, '0');

  return `ESC-${datePart}-${randomPart}${ms}`;
}

/**
 * Generate a transaction ID for payments
 * Format: TXN-YYYYMMDD-HHMMSS-RANDOM
 */
export function generateTransactionId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `TXN-${datePart}-${timePart}-${randomPart}`;
}

/**
 * Format currency amount with proper decimal places
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Calculate nights between two dates
 */
export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (international)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate document number based on type
 */
export function isValidDocumentNumber(documentType: string, number: string): boolean {
  switch (documentType) {
    case 'dni':
      // Argentine DNI: 6-9 digits
      return /^\d{6,9}$/.test(number);
    case 'passport':
      // Generic passport: 6-12 alphanumeric characters
      return /^[A-Z0-9]{6,12}$/i.test(number);
    case 'cedula':
      // Uruguayan/Central American cedula: 6-12 digits
      return /^\d{6,12}$/.test(number);
    default:
      return number.length >= 5;
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, locale: string = 'es-UY'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if user is a child based on age
 */
export function isChild(age: number, childAgeThreshold: number = 12): boolean {
  return age < childAgeThreshold;
}

/**
 * Check if user is a senior
 */
export function isSenior(age: number, seniorAgeThreshold: number = 65): boolean {
  return age >= seniorAgeThreshold;
}

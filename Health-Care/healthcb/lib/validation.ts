// lib/validation.ts
interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a password against security requirements
 * @param password The password to validate
 * @returns Object containing validation result and any errors
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!isLongEnough) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!hasNumber) {
    errors.push('Password must contain at least one number');
  }

  if (!hasSpecial) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an email address format
 * @param email The email to validate
 * @returns True if email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if two passwords match
 * @param password The password
 * @param confirmPassword The confirmation password
 * @returns True if passwords match, false otherwise
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Validates a phone number format
 * @param phone The phone number to validate
 * @returns True if phone number is valid, false otherwise
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(09|\+639)\d{9}$/;
  return phoneRegex.test(phone);
}
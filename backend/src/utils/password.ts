export interface PasswordValidationResult {
  ok: boolean;
  errors: string[];
}

const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "123456789",
  "qwerty",
  "111111",
  "12345678",
  "abc123",
  "password1",
  "1234567",
  "iloveyou",
]);

export function validatePasswordStrength(password: string, email?: string): PasswordValidationResult {
  const errors: string[] = [];

  if (typeof password !== "string") {
    return { ok: false, errors: ["Password must be a string."] };
  }

  // Length
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long.");
  }

  // Character classes
  if (!/[a-z]/.test(password)) errors.push("Include at least one lowercase letter.");
  if (!/[A-Z]/.test(password)) errors.push("Include at least one uppercase letter.");
  if (!/[0-9]/.test(password)) errors.push("Include at least one number.");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) errors.push("Include at least one special character.");

  // Whitespace not allowed
  if (/\s/.test(password)) errors.push("Password cannot contain spaces.");

  // Common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push("Password is too common.");
  }

  // Repeated sequences (3 or more of same char)
  if (/(.)\1\1/.test(password)) {
    errors.push("Avoid three or more repeating characters.");
  }

  // Contains email local-part (if provided)
  if (email && typeof email === "string") {
    const local = email.split("@")[0]?.toLowerCase();
    if (local && local.length >= 4 && password.toLowerCase().includes(local)) {
      errors.push("Password cannot contain your email name.");
    }
  }

  return { ok: errors.length === 0, errors };
}



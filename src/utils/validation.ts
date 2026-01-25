// Danh sách các domain email giả/tạm thời phổ biến
const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "throwaway.email",
  "temp-mail.org",
  "fakeinbox.com",
  "trashmail.com",
  "yopmail.com",
  "maildrop.cc",
  "getnada.com",
  "temp-mail.io",
  "dispostable.com",
];

/**
 * Kiểm tra định dạng email cơ bản
 */
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra email có phải là disposable/fake email
 */
export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

/**
 * Kiểm tra email có hợp lệ (format + không phải fake)
 */
export const validateEmail = (
  email: string,
): { valid: boolean; error?: string } => {
  if (!email || email.trim() === "") {
    return { valid: false, error: "Email is required" };
  }

  if (!isValidEmailFormat(email)) {
    return { valid: false, error: `Email address "${email}" is invalid` };
  }

  if (isDisposableEmail(email)) {
    return {
      valid: false,
      error: "Disposable email addresses are not allowed",
    };
  }

  return { valid: true };
};

/**
 * Kiểm tra độ mạnh của password
 * - Tối thiểu 8 ký tự
 * - Có chữ hoa
 * - Có chữ thường
 * - Có số
 * - Có ký tự đặc biệt (optional nhưng recommended)
 */
export const validatePasswordStrength = (
  password: string,
): {
  valid: boolean;
  error?: string;
  strength?: "weak" | "medium" | "strong";
} => {
  if (!password || password.trim() === "") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!hasLowerCase) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (!hasNumber) {
    return { valid: false, error: "Password must contain at least one number" };
  }

  // Tính strength
  let strength: "weak" | "medium" | "strong" = "medium";

  if (password.length >= 12 && hasSpecialChar) {
    strength = "strong";
  } else if (password.length < 10 || !hasSpecialChar) {
    strength = "weak";
  }

  return { valid: true, strength };
};

/**
 * Kiểm tra password confirmation có khớp không
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): {
  valid: boolean;
  error?: string;
} => {
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" };
  }
  return { valid: true };
};

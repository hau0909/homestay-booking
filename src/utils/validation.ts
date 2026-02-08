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
export const isValidEmailFormat = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra email có phải là disposable/fake email
 */
export const isDisposableEmail = (email: string) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

/**
 * Kiểm tra email có hợp lệ (format + không phải fake)
 */
export const validateEmail = (email: string) => {
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
export const validatePasswordStrength = (password: string) => {
  if (!password?.trim()) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  const rules = {
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  if (!rules.upper)
    return { valid: false, error: "Must contain an uppercase letter" };

  if (!rules.lower)
    return { valid: false, error: "Must contain a lowercase letter" };

  if (!rules.number) return { valid: false, error: "Must contain a number" };

  // 4. Tính độ mạnh
  let strength: "weak" | "medium" | "strong" = "medium";

  if (password.length >= 12 && rules.special) {
    strength = "strong";
  } else if (password.length < 10 || !rules.special) {
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
) => {
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" };
  }
  return { valid: true };
};

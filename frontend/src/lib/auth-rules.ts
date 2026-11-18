// Shared by the client-side password checklist and the server action. Contains
// no secrets and no server-only imports, so both bundles can use it.

export const NAME_MIN = 2;
export const NAME_MAX = 50;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt only hashes the first 72 bytes.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COMMON_PASSWORDS = [
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
  "admin123",
  "letmein1",
  "welcome1",
  "iloveyou1",
];

export interface PasswordRule {
  id: string;
  label: string;
  met: boolean;
}

export function getPasswordRules(value: string): PasswordRule[] {
  return [
    {
      id: "length",
      label: `${PASSWORD_MIN}–${PASSWORD_MAX} characters`,
      met: value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX,
    },
    { id: "lower", label: "One lowercase letter", met: /[a-z]/.test(value) },
    { id: "upper", label: "One uppercase letter", met: /[A-Z]/.test(value) },
    { id: "digit", label: "One number", met: /[0-9]/.test(value) },
    {
      id: "special",
      label: "One special character",
      met: /[^A-Za-z0-9]/.test(value),
    },
    {
      id: "common",
      label: "Not a common password",
      met: value.length > 0 && !COMMON_PASSWORDS.includes(value.toLowerCase()),
    },
  ];
}

export function isPasswordStrong(value: string): boolean {
  return getPasswordRules(value).every((rule) => rule.met);
}

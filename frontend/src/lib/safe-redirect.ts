export const DEFAULT_REDIRECT = "/account";

// Only local absolute paths are allowed. Reject protocol-relative URLs ("//"),
// backslashes (which browsers can normalise into "//") and control characters.
export function safeRedirectPath(value: string | string[] | undefined): string {
  if (typeof value !== "string" || value.length === 0) return DEFAULT_REDIRECT;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_REDIRECT;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return DEFAULT_REDIRECT;
  return value;
}

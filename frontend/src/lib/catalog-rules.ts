// Mirrors validators/category.validator.js. The backend is authoritative;
// these checks make form errors immediate and keep bad payloads off the wire.
export const CATEGORY_NAME_MIN = 2;
export const CATEGORY_NAME_MAX = 50;

const CATEGORY_ID_PATTERN = /^[a-f\d]{24}$/i;

export function isCategoryId(value: string): boolean {
  return CATEGORY_ID_PATTERN.test(value);
}

export function validateCategoryName(name: string): string | null {
  if (name.length === 0) return "Category name is required";
  if (name.length < CATEGORY_NAME_MIN || name.length > CATEGORY_NAME_MAX) {
    return `Category name must be between ${CATEGORY_NAME_MIN} and ${CATEGORY_NAME_MAX} characters`;
  }
  return null;
}

// Mirrors validators/product.validator.js and models/Product.model.js. The API
// remains authoritative; these checks make form errors immediate and keep
// malformed payloads off the wire.
import type { Product } from "./types";

export const PRODUCT_NAME_MIN = 2;
export const PRODUCT_NAME_MAX = 50;
export const PRODUCT_DESCRIPTION_MIN = 10;
export const PRODUCT_DESCRIPTION_MAX = 200;
export const PRODUCT_PRICE_MIN = 0;
export const PRODUCT_PRICE_MAX = 1000000;
export const PRODUCT_QUANTITY_MIN = 0;
export const PRODUCT_QUANTITY_MAX = 100000;
export const PRODUCT_MAX_IMAGES = 5;
export const PRODUCT_PAGE_SIZE = 20;

// Must match SORT_KEYS in validators/product.validator.js and SORTS in
// controllers/product.controller.js.
export const PRODUCT_SORTS = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

const PRODUCT_ID_PATTERN = /^[a-f\d]{24}$/i;

export function isProductId(value: string): boolean {
  return PRODUCT_ID_PATTERN.test(value);
}

export function productCategoryId(category: Product["category"]): string {
  return typeof category === "string" ? category : category._id;
}

export interface ProductFormValues {
  productId: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
  images: string;
}

export const emptyProductFormValues: ProductFormValues = {
  productId: "",
  name: "",
  description: "",
  price: "",
  quantity: "",
  category: "",
  images: "",
};

export type ProductFieldName =
  | "name"
  | "description"
  | "price"
  | "quantity"
  | "category"
  | "images";

export type ProductFieldErrors = Partial<Record<ProductFieldName, string>>;

export type ProductPayload = Record<string, string | number | string[]>;

export interface ProductValidationResult {
  payload: ProductPayload;
  errors: ProductFieldErrors;
  // The API cannot accept an empty description (schema minimum is 10), so an
  // edit that clears the box leaves the stored description untouched.
  skippedDescription: boolean;
}

function normalizeImageText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function parseImageUrls(text: string): {
  images: string[];
  error?: string;
} {
  const images = normalizeImageText(text).split("\n").filter(Boolean);
  if (images.length > PRODUCT_MAX_IMAGES) {
    return {
      images,
      error: `Images must be at most ${PRODUCT_MAX_IMAGES} URLs, one per line`,
    };
  }

  for (const image of images) {
    let url: URL;
    try {
      url = new URL(image);
    } catch {
      return { images, error: "Each image must be a valid URL" };
    }
    // express-validator's isURL() requires a protocol and a TLD by default.
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !url.hostname.includes(".")
    ) {
      return { images, error: "Each image must be a valid URL" };
    }
  }

  return { images };
}

export function validateProductValues(
  values: ProductFormValues,
  mode: "create" | "update",
  original?: ProductFormValues,
): ProductValidationResult {
  const payload: ProductPayload = {};
  const errors: ProductFieldErrors = {};
  const trimmed = (key: keyof ProductFormValues) => values[key].trim();
  const changed = (key: keyof ProductFormValues) =>
    !original || trimmed(key) !== (original[key] ?? "").trim();
  let skippedDescription = false;

  const name = trimmed("name");
  if (mode === "create" || changed("name")) {
    if (!name) {
      errors.name =
        mode === "create"
          ? "Product name is required"
          : "Product name cannot be empty";
    } else if (
      name.length < PRODUCT_NAME_MIN ||
      name.length > PRODUCT_NAME_MAX
    ) {
      errors.name = `Product name must be between ${PRODUCT_NAME_MIN} and ${PRODUCT_NAME_MAX} characters`;
    } else {
      payload.name = name;
    }
  }

  const description = trimmed("description");
  if (mode === "create" || changed("description")) {
    if (!description) {
      // Omit entirely on create: the schema rejects "". On edit, say why the
      // existing text was kept rather than pretending it was cleared.
      if (mode === "update") skippedDescription = true;
    } else if (
      description.length < PRODUCT_DESCRIPTION_MIN ||
      description.length > PRODUCT_DESCRIPTION_MAX
    ) {
      errors.description = `Description must be between ${PRODUCT_DESCRIPTION_MIN} and ${PRODUCT_DESCRIPTION_MAX} characters`;
    } else {
      payload.description = description;
    }
  }

  const priceText = trimmed("price");
  if (mode === "create" || changed("price")) {
    const price = Number(priceText);
    if (!priceText || !Number.isFinite(price)) {
      errors.price = "Price is required";
    } else if (price < PRODUCT_PRICE_MIN || price > PRODUCT_PRICE_MAX) {
      errors.price = `Price must be a number between ${PRODUCT_PRICE_MIN} and ${PRODUCT_PRICE_MAX}`;
    } else {
      payload.price = price;
    }
  }

  const quantityText = trimmed("quantity");
  if (mode === "create" || changed("quantity")) {
    const quantity = Number(quantityText);
    if (!quantityText || !Number.isInteger(quantity)) {
      errors.quantity = "Quantity is required and must be a whole number";
    } else if (
      quantity < PRODUCT_QUANTITY_MIN ||
      quantity > PRODUCT_QUANTITY_MAX
    ) {
      errors.quantity = `Quantity must be a whole number between ${PRODUCT_QUANTITY_MIN} and ${PRODUCT_QUANTITY_MAX}`;
    } else {
      payload.quantity = quantity;
    }
  }

  const category = trimmed("category");
  if (mode === "create" || changed("category")) {
    if (!category) {
      errors.category =
        mode === "create"
          ? "Category is required"
          : "Category cannot be empty";
    } else if (!isProductId(category)) {
      errors.category = "Category must be a valid category id";
    } else {
      payload.category = category;
    }
  }

  if (mode === "create" || changed("images")) {
    const { images, error } = parseImageUrls(trimmed("images"));
    if (error) errors.images = error;
    else payload.images = images;
  }

  return { payload, errors, skippedDescription };
}

export interface AdminProductFilters {
  q?: string;
  category?: string;
  sort: ProductSort;
  page: number;
}

export interface ParsedProductFilters {
  filters: AdminProductFilters;
  query: string;
  invalid: boolean;
}

export function parseAdminProductFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ParsedProductFilters {
  let invalid = false;
  const single = (key: string): string | undefined => {
    const value = searchParams[key];
    if (Array.isArray(value)) {
      invalid = true;
      return undefined;
    }
    return typeof value === "string" ? value : undefined;
  };

  const filters: AdminProductFilters = { sort: "newest", page: 1 };

  const rawQuery = single("q")?.trim();
  if (rawQuery) {
    if (rawQuery.length < 2 || rawQuery.length > 100) invalid = true;
    else filters.q = rawQuery;
  }

  const rawCategory = single("category")?.trim();
  if (rawCategory) {
    if (!isProductId(rawCategory)) invalid = true;
    else filters.category = rawCategory;
  }

  const rawSort = single("sort")?.trim();
  if (rawSort) {
    if ((PRODUCT_SORTS as readonly string[]).includes(rawSort)) {
      filters.sort = rawSort as ProductSort;
    } else {
      invalid = true;
    }
  }

  const rawPage = single("page")?.trim();
  if (rawPage) {
    const page = Number(rawPage);
    if (/^\d+$/.test(rawPage) && Number.isInteger(page) && page >= 1 && page <= 10000) {
      filters.page = page;
    } else {
      invalid = true;
    }
  }

  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(PRODUCT_PAGE_SIZE));
  params.set("sort", filters.sort);
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);

  return { filters, query: params.toString(), invalid };
}

export function buildAdminProductsHref(
  filters: AdminProductFilters,
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  params.set("sort", filters.sort);
  params.set("page", String(page));
  return `/admin/products?${params.toString()}`;
}

export function productFormValuesFromProduct(
  product: Product,
): ProductFormValues {
  return {
    productId: product._id,
    name: product.name,
    description: product.description ?? "",
    price: String(product.price),
    quantity: String(product.quantity),
    category: productCategoryId(product.category),
    images: (product.images ?? []).join("\n"),
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isCategoryId, validateCategoryName } from "@/lib/catalog-rules";
import type {
  CategoryActionState,
  ProductActionState,
} from "@/lib/catalog-state";
import { ApiError, apiFetch } from "@/lib/api";
import {
  emptyProductFormValues,
  isProductId,
  validateProductValues,
  type ProductFieldErrors,
  type ProductFormValues,
} from "@/lib/product-rules";
import { getAuthCookieHeader, getCurrentUser } from "@/lib/session";
import type { Category, Product } from "@/lib/types";

const CATEGORIES_PATH = "/admin/categories";
const PRODUCTS_PATH = "/admin/products";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireAdmin(accessPath = CATEGORIES_PATH): Promise<string> {
  const cookie = await getAuthCookieHeader();
  const next = encodeURIComponent(accessPath);
  if (!cookie) redirect(`/login?next=${next}`);

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${next}`);
  if (user.role !== "admin") redirect("/account");

  return cookie;
}

function revalidateCatalog(productId?: string): void {
  revalidatePath("/");
  // /products is built in a later phase; invalidating it now is harmless and
  // keeps this action correct once the listing route exists.
  revalidatePath("/products");
  if (productId && isProductId(productId)) {
    revalidatePath(`/products/${productId}`);
  }
  revalidatePath("/admin");
  revalidatePath(CATEGORIES_PATH);
  revalidatePath(PRODUCTS_PATH);
}

function ok(
  previous: CategoryActionState,
  message: string,
  values: CategoryActionState["values"],
): CategoryActionState {
  return {
    status: "ok",
    message,
    fieldErrors: {},
    values,
    submissionId: previous.submissionId + 1,
  };
}

function fail(
  previous: CategoryActionState,
  message: string | null,
  fieldErrors: CategoryActionState["fieldErrors"],
  values: CategoryActionState["values"],
): CategoryActionState {
  return {
    status: "error",
    message,
    fieldErrors,
    values,
    submissionId: previous.submissionId + 1,
  };
}

function toFailure(
  error: unknown,
  previous: CategoryActionState,
  values: CategoryActionState["values"],
  fallback: string,
): CategoryActionState {
  if (!(error instanceof ApiError)) {
    return fail(previous, fallback, {}, values);
  }

  const fieldErrors: CategoryActionState["fieldErrors"] = {};
  for (const issue of error.errors) {
    if (issue.field === "name" && !fieldErrors.name) {
      fieldErrors.name = issue.message;
    }
  }

  const hasFieldError = Boolean(fieldErrors.name);
  return fail(
    previous,
    hasFieldError ? null : error.message || fallback,
    fieldErrors,
    values,
  );
}

// Auth failures are redirected after the try/catch so NEXT_REDIRECT is never
// swallowed. Everything else becomes an honest inline form message.
function handleAccess(
  error: unknown,
  previous: CategoryActionState,
  values: CategoryActionState["values"],
  fallback: string,
): CategoryActionState {
  if (error instanceof ApiError && error.status === 401) {
    redirect(`/login?next=${encodeURIComponent(CATEGORIES_PATH)}`);
  }
  if (error instanceof ApiError && error.status === 403) {
    redirect("/account");
  }
  return toFailure(error, previous, values, fallback);
}

function readProductForm(formData: FormData): ProductFormValues {
  return {
    productId: readField(formData, "productId"),
    name: readField(formData, "name"),
    description: readField(formData, "description"),
    price: readField(formData, "price"),
    quantity: readField(formData, "quantity"),
    category: readField(formData, "category"),
    images: readField(formData, "images"),
  };
}

function readOriginalProductForm(formData: FormData): ProductFormValues {
  return {
    productId: readField(formData, "originalProductId"),
    name: readField(formData, "originalName"),
    description: readField(formData, "originalDescription"),
    price: readField(formData, "originalPrice"),
    quantity: readField(formData, "originalQuantity"),
    category: readField(formData, "originalCategory"),
    images: readField(formData, "originalImages"),
  };
}

function productOk(
  previous: ProductActionState,
  message: string,
  values: ProductFormValues,
): ProductActionState {
  return {
    status: "ok",
    message,
    fieldErrors: {},
    values,
    submissionId: previous.submissionId + 1,
  };
}

function productFail(
  previous: ProductActionState,
  message: string | null,
  fieldErrors: ProductFieldErrors,
  values: ProductFormValues,
): ProductActionState {
  return {
    status: "error",
    message,
    fieldErrors,
    values,
    submissionId: previous.submissionId + 1,
  };
}

function toProductFailure(
  error: unknown,
  previous: ProductActionState,
  values: ProductFormValues,
  fallback: string,
): ProductActionState {
  if (!(error instanceof ApiError)) {
    return productFail(previous, fallback, {}, values);
  }

  const fieldErrors: ProductFieldErrors = {};
  for (const issue of error.errors) {
    const field = issue.field;
    if (
      (field === "name" ||
        field === "description" ||
        field === "price" ||
        field === "quantity" ||
        field === "category") &&
      !fieldErrors[field]
    ) {
      fieldErrors[field] = issue.message;
    } else if (field.startsWith("images") && !fieldErrors.images) {
      fieldErrors.images = issue.message;
    }
  }

  const hasFieldError = Object.keys(fieldErrors).length > 0;
  return productFail(
    previous,
    hasFieldError ? null : error.message || fallback,
    fieldErrors,
    values,
  );
}

function handleProductAccess(
  error: unknown,
  previous: ProductActionState,
  values: ProductFormValues,
  fallback: string,
): ProductActionState {
  if (error instanceof ApiError && error.status === 401) {
    redirect(`/login?next=${encodeURIComponent(PRODUCTS_PATH)}`);
  }
  if (error instanceof ApiError && error.status === 403) {
    redirect("/account");
  }
  return toProductFailure(error, previous, values, fallback);
}

export async function createCategoryAction(
  previous: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  // A Server Action is a public POST endpoint: check the role here too, even
  // though the form is only rendered on an admin page.
  const cookie = await requireAdmin();
  const name = readField(formData, "name");
  const values = { name, categoryId: "" };

  const nameError = validateCategoryName(name);
  if (nameError) {
    return fail(previous, null, { name: nameError }, values);
  }

  try {
    await apiFetch<Category>("/categories", {
      method: "POST",
      cookie,
      body: { name },
    });
  } catch (error) {
    return handleAccess(error, previous, values, "Could not create the category");
  }

  revalidateCatalog();
  return ok(previous, "Category created.", { name: "", categoryId: "" });
}

export async function updateCategoryAction(
  previous: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const cookie = await requireAdmin();
  const categoryId = readField(formData, "categoryId");
  const name = readField(formData, "name");
  const values = { name, categoryId };

  if (!isCategoryId(categoryId)) {
    return fail(previous, "Invalid category id", {}, values);
  }

  const nameError = validateCategoryName(name);
  if (nameError) {
    return fail(previous, null, { name: nameError }, values);
  }

  try {
    await apiFetch<Category>(`/categories/${categoryId}`, {
      method: "PUT",
      cookie,
      // Only the validated name is sent. Injected _id/role fields are ignored.
      body: { name },
    });
  } catch (error) {
    return handleAccess(error, previous, values, "Could not rename the category");
  }

  revalidateCatalog();
  return ok(previous, "Category renamed.", values);
}

export async function deleteCategoryAction(
  previous: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const cookie = await requireAdmin();
  const categoryId = readField(formData, "categoryId");
  const values = { name: "", categoryId };

  if (!isCategoryId(categoryId)) {
    return fail(previous, "Invalid category id", {}, values);
  }

  try {
    await apiFetch<{ message?: string }>(`/categories/${categoryId}`, {
      method: "DELETE",
      cookie,
    });
  } catch (error) {
    return handleAccess(error, previous, values, "Could not delete the category");
  }

  revalidateCatalog();
  return ok(previous, "Category deleted.", values);
}

export async function createProductAction(
  previous: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const cookie = await requireAdmin(PRODUCTS_PATH);
  const values = readProductForm(formData);
  const { payload, errors } = validateProductValues(values, "create");

  if (Object.keys(errors).length > 0) {
    return productFail(previous, null, errors, values);
  }

  let created: Product;
  try {
    const result = await apiFetch<Product>("/products", {
      method: "POST",
      cookie,
      // Only validated fields are sent. Injected _id/slug/role never leave here.
      body: payload,
    });
    created = result.data;
  } catch (error) {
    return handleProductAccess(error, previous, values, "Could not create the product");
  }

  revalidateCatalog(created?._id);
  return productOk(previous, "Product created.", emptyProductFormValues);
}

export async function updateProductAction(
  previous: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const cookie = await requireAdmin(PRODUCTS_PATH);
  const values = readProductForm(formData);
  const original = readOriginalProductForm(formData);

  if (!isProductId(values.productId)) {
    return productFail(previous, "Invalid product id", {}, values);
  }

  const { payload, errors, skippedDescription } = validateProductValues(
    values,
    "update",
    original,
  );

  if (Object.keys(errors).length > 0) {
    return productFail(previous, null, errors, values);
  }
  if (Object.keys(payload).length === 0) {
    return productFail(
      previous,
      "Change at least one field before saving.",
      {},
      values,
    );
  }

  try {
    await apiFetch<Product>(`/products/${values.productId}`, {
      method: "PATCH",
      cookie,
      body: payload,
    });
  } catch (error) {
    return handleProductAccess(error, previous, values, "Could not update the product");
  }

  revalidateCatalog(values.productId);
  return productOk(
    previous,
    skippedDescription
      ? "Product updated. Description left unchanged (10 characters minimum)."
      : "Product updated.",
    values,
  );
}

export async function deleteProductAction(
  previous: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const cookie = await requireAdmin(PRODUCTS_PATH);
  const productId = readField(formData, "productId");
  const values = { ...emptyProductFormValues, productId };

  if (!isProductId(productId)) {
    return productFail(previous, "Invalid product id", {}, values);
  }

  try {
    await apiFetch<{ message?: string }>(`/products/${productId}`, {
      method: "DELETE",
      cookie,
    });
  } catch (error) {
    return handleProductAccess(error, previous, values, "Could not delete the product");
  }

  revalidateCatalog(productId);
  return productOk(previous, "Product deleted.", values);
}

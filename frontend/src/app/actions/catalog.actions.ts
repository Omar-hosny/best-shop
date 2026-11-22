"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isCategoryId, validateCategoryName } from "@/lib/catalog-rules";
import type { CategoryActionState } from "@/lib/catalog-state";
import { ApiError, apiFetch } from "@/lib/api";
import { getAuthCookieHeader, getCurrentUser } from "@/lib/session";
import type { Category } from "@/lib/types";

const CATEGORIES_PATH = "/admin/categories";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireAdmin(): Promise<string> {
  const cookie = await getAuthCookieHeader();
  const next = encodeURIComponent(CATEGORIES_PATH);
  if (!cookie) redirect(`/login?next=${next}`);

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${next}`);
  if (user.role !== "admin") redirect("/account");

  return cookie;
}

function revalidateCatalog(): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(CATEGORIES_PATH);
  revalidatePath("/admin/products");
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

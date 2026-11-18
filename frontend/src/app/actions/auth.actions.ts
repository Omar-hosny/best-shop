"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { authRequest, logoutRequest } from "@/lib/auth-api";
import {
  EMAIL_PATTERN,
  isPasswordStrong,
  NAME_MAX,
  NAME_MIN,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from "@/lib/auth-rules";
import type { AuthState } from "@/lib/auth-state";
import { JWT_COOKIE } from "@/lib/session";
import { safeRedirectPath } from "@/lib/safe-redirect";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function toAuthState(error: unknown, values: AuthState["values"] = {}): AuthState {
  if (error instanceof ApiError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.errors) {
      if (issue.field && !fieldErrors[issue.field]) {
        fieldErrors[issue.field] = issue.message;
      }
    }
    const hasFields = Object.keys(fieldErrors).length > 0;
    return {
      status: "error",
      message: hasFields ? null : (error.message || "Something went wrong"),
      fieldErrors,
      values,
    };
  }
  return {
    status: "error",
    message: "Something went wrong. Please try again.",
    fieldErrors: {},
    values,
  };
}

async function setAuthCookie(token: string) {
  // Mirrors lib/cookie.js in the API. A mismatch (especially path or sameSite)
  // leaves a stale cookie that makes logout appear to do nothing.
  (await cookies()).set(JWT_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function loginAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");
  const next = safeRedirectPath(readField(formData, "next"));

  // Cheap checks first: never spend a network round trip on an empty payload.
  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Email is required";
  else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Please provide a valid email address";
  }
  if (!password) fieldErrors.password = "Password is required";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: null, fieldErrors, values: { email } };
  }

  let token: string;
  try {
    const result = await authRequest("/auth/login", { email, password });
    token = result.token;
  } catch (error) {
    return toAuthState(error, { email });
  }

  await setAuthCookie(token);
  refresh();
  // redirect() throws NEXT_REDIRECT — it must stay outside try/catch.
  redirect(next);
}

export async function registerAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = readField(formData, "name").trim();
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirmPassword");
  const next = safeRedirectPath(readField(formData, "next"));

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Name is required";
  else if (name.length < NAME_MIN || name.length > NAME_MAX) {
    fieldErrors.name = `Name must be between ${NAME_MIN} and ${NAME_MAX} characters`;
  }
  if (!email) fieldErrors.email = "Email is required";
  else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Please provide a valid email address";
  }
  if (!password) fieldErrors.password = "Password is required";
  else if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    fieldErrors.password = `Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`;
  } else if (!isPasswordStrong(password)) {
    fieldErrors.password =
      "Use upper and lower case letters, a number, a special character, and avoid common passwords";
  }
  if (!confirmPassword) fieldErrors.confirmPassword = "Please confirm your password";
  else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: null,
      fieldErrors,
      values: { name, email },
    };
  }

  let token: string;
  try {
    const result = await authRequest("/auth/register", { name, email, password });
    token = result.token;
  } catch (error) {
    return toAuthState(error, { name, email });
  }

  await setAuthCookie(token);
  refresh();
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(JWT_COOKIE)?.value;
  await logoutRequest(token ? `${JWT_COOKIE}=${token}` : undefined);
  store.delete(JWT_COOKIE);
  refresh();
  redirect("/login");
}

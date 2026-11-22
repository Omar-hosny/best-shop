import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { ApiError, apiFetch } from "./api";
import type { User } from "./types";

export const JWT_COOKIE = "jwt";

// Shared by every server-side read/action that has to forward the session to
// the API. Keeping the cookie name here avoids a silent mismatch.
export const getAuthCookieHeader = async (): Promise<string | null> => {
  const token = (await cookies()).get(JWT_COOKIE)?.value;
  return token ? `${JWT_COOKIE}=${token}` : null;
};

// React cache() deduplicates the /auth/me call when several components in the
// same request ask for the session (header, page, account links).
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookie = await getAuthCookieHeader();
  if (!cookie) return null;

  try {
    const { data } = await apiFetch<User>("/auth/me", { cookie });
    return data;
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 404 || error.status === 0)
    ) {
      return null;
    }
    throw error;
  }
});

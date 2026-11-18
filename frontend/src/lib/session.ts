import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { ApiError, apiFetch } from "./api";
import type { User } from "./types";

export const JWT_COOKIE = "jwt";

// React cache() deduplicates the /auth/me call when several components in the
// same request ask for the session (header, page, account links).
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(JWT_COOKIE)?.value;
  if (!token) return null;

  try {
    const { data } = await apiFetch<User>("/auth/me", {
      cookie: `${JWT_COOKIE}=${token}`,
    });
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

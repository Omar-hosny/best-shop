// Server-only. The auth endpoints return the user in the body but put the JWT
// in an httpOnly Set-Cookie, so this module keeps the raw response headers —
// unlike the general-purpose apiFetch(), which intentionally drops them.
import "server-only";

import { ApiError } from "./api";
import type { User, ValidationIssue } from "./types";

const JWT_COOKIE = "jwt";

interface ApiEnvelope<T> {
  success?: boolean;
  status?: string;
  data?: T;
  message?: string;
  errors?: ValidationIssue[];
}

export interface AuthResult {
  user: User;
  token: string;
}

const getBaseUrl = () => {
  const base = process.env.API_BASE_URL;
  if (!base) throw new ApiError(500, "API_BASE_URL is not configured");
  return base.replace(/\/$/, "");
};

function extractJwt(response: Response): string | null {
  // getSetCookie() exists on Node 22; the fallback keeps older runtimes working.
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies = headers.getSetCookie
    ? headers.getSetCookie()
    : [headers.get("set-cookie") ?? ""];

  for (const entry of setCookies) {
    const pair = entry.split(";", 1)[0];
    const equals = pair.indexOf("=");
    if (equals > 0 && pair.slice(0, equals).trim() === JWT_COOKIE) {
      const value = pair.slice(equals + 1).trim();
      return value ? decodeURIComponent(value) : null;
    }
  }
  return null;
}

async function parsePayload(response: Response): Promise<ApiEnvelope<User>> {
  try {
    return (await response.json()) as ApiEnvelope<User>;
  } catch {
    return {};
  }
}

export async function authRequest(
  path: "/auth/login" | "/auth/register",
  body: { email: string; password: string; name?: string },
): Promise<AuthResult> {
  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Could not reach the API");
  }

  const payload = await parsePayload(response);

  if (!response.ok || payload.success === false) {
    throw new ApiError(
      response.status,
      payload.message ?? `Request failed with status ${response.status}`,
      payload.errors ?? [],
    );
  }

  if (!payload.data) {
    throw new ApiError(response.status, "API returned an invalid response");
  }

  const token = extractJwt(response);
  if (!token) {
    throw new ApiError(500, "Authentication cookie was missing from the response");
  }

  return { user: payload.data, token };
}

// The backend logout is stateless; deleting our own cookie is what actually
// signs the user out. Calling through keeps the API contract symmetric and
// makes a future server-side revocation work without another frontend change.
export async function logoutRequest(cookie?: string): Promise<void> {
  try {
    await fetch(`${getBaseUrl()}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(cookie ? { cookie } : {}),
      },
      cache: "no-store",
    });
  } catch {
    // Best effort: the local cookie is deleted by the caller regardless.
  }
}

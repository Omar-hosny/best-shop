// Server-only API client. Importing this from a Client Component is a build
// error, which keeps API_BASE_URL and forwarded cookies out of the browser.
import "server-only";

import type { Pagination, ValidationIssue } from "./types";

interface ApiEnvelope<T> {
  // Most routes use `success`. createCategory still uses `status: "success"`.
  success?: boolean;
  status?: string;
  data: T;
  pagination?: Pagination;
  message?: string;
  errors?: ValidationIssue[];
}

export interface ApiResult<T> {
  data: T;
  pagination?: Pagination;
}

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // Raw Cookie header value, forwarded by protected Server Components/Actions.
  cookie?: string;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ValidationIssue[];

  constructor(status: number, message: string, errors: ValidationIssue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const getBaseUrl = () => {
  const base = process.env.API_BASE_URL;
  if (!base) {
    throw new ApiError(500, "API_BASE_URL is not configured");
  }
  return base.replace(/\/$/, "");
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.cookie) {
    headers.cookie = options.cookie;
  }

  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch {
    // A network failure must not masquerade as a validation or auth error.
    throw new ApiError(0, "Could not reach the API");
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON bodies (proxy errors, HTML 404s) still become a typed error.
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      response.status,
      payload?.message ?? `Request failed with status ${response.status}`,
      payload?.errors ?? [],
    );
  }

  if (!payload) {
    throw new ApiError(response.status, "API returned an invalid response");
  }

  return { data: payload.data, pagination: payload.pagination };
}

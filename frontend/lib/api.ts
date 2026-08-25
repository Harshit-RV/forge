export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type Token = string | null;

export async function request<T>(
  path: string,
  token: Token,
  init?: RequestInit
): Promise<T> {
  if (!token) {
    throw new ApiError("Not signed in", 401);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  const text = await response.text();
  let body: { error?: string; message?: string } | null = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new ApiError("Invalid JSON response", response.status);
      }
    }
  }

  if (!response.ok) {
    const message =
      body?.error ?? body?.message ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

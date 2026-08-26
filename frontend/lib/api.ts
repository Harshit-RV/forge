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

/** POST and consume an application/x-ndjson body, invoking onLine per JSON object. */
export async function requestNdjson<T>(
  path: string,
  token: Token,
  body: unknown,
  onLine: (item: T) => void,
  init?: Omit<RequestInit, "body" | "method">
): Promise<void> {
  if (!token) {
    throw new ApiError("Not signed in", 401);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Request failed (${response.status})`;
    if (text) {
      try {
        const parsed = JSON.parse(text) as { error?: string; message?: string };
        message = parsed.error ?? parsed.message ?? message;
      } catch {
        message = text;
      }
    }
    throw new ApiError(message, response.status);
  }

  if (!response.body) {
    throw new ApiError("Empty stream response", response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline = buffer.indexOf("\n");
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) {
        onLine(JSON.parse(line) as T);
      }
      newline = buffer.indexOf("\n");
    }
  }

  const tail = buffer.trim();
  if (tail) {
    onLine(JSON.parse(tail) as T);
  }
}

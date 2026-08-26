type ApiError = { code?: number; statusCode?: number; body?: { code?: number } | string };

function statusCode(error: unknown): number | undefined {
  const err = (error ?? {}) as ApiError;
  if (typeof err.code === 'number') return err.code;
  if (typeof err.statusCode === 'number') return err.statusCode;

  const { body } = err;
  if (body && typeof body === 'object' && typeof body.code === 'number') return body.code;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as { code?: number };
      if (typeof parsed.code === 'number') return parsed.code;
    } catch {
      // not JSON; fall through
    }
  }

  return undefined;
}

export function isNotFound(error: unknown): boolean {
  return statusCode(error) === 404;
}

export function isAlreadyExists(error: unknown): boolean {
  return statusCode(error) === 409;
}

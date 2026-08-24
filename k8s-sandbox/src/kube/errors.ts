export function isNotFound(error: unknown): boolean {
  const err = error as { code?: number; statusCode?: number; body?: { code?: number } };
  return err.code === 404 || err.statusCode === 404 || err.body?.code === 404;
}

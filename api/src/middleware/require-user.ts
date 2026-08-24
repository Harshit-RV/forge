import { getAuth } from '@clerk/express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export interface AuthedRequest extends Request {
  userId: string;
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated!' });
  }
  (req as AuthedRequest).userId = userId;
  next();
}

export function authed(
  handler: (req: AuthedRequest, res: Response) => unknown
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req as AuthedRequest, res)).catch(next);
  };
}

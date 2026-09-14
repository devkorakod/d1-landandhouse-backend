import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import type { UserRole } from '../types/index.js';

export interface AuthPayload {
  sub: string;
  realm: 'staff' | 'customer';
  role?: UserRole;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { auth?: AuthPayload }
  }
}

function extract(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export const authenticate =
  (realm: 'staff' | 'customer') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const token = extract(req);
    if (!token) return next(ApiError.unauthorized());
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
      if (payload.realm !== realm) return next(ApiError.forbidden());
      req.auth = payload;
      next();
    } catch (e) {
      const expired = e instanceof jwt.TokenExpiredError;
      next(new ApiError(401, expired ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED',
        expired ? 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' : 'กรุณาเข้าสู่ระบบ'));
    }
  };

/** ให้ผ่านได้แม้ไม่มี token — ใช้กับ endpoint สาธารณะที่อยากรู้ว่าใครล็อกอินอยู่ */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = extract(req);
  if (!token) return next();
  try { req.auth = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload; } catch { /* ignore */ }
  next();
};

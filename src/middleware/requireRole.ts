import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import type { UserRole } from '../types/index.js';

/**
 * บังคับสิทธิ์ฝั่ง server — การซ่อนเมนูใน UI ไม่ใช่มาตรการความปลอดภัย
 * ใช้ requireRole('owner') กับทุก endpoint ที่เอกสารระบุว่าเป็นของ Owner
 */
export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(ApiError.unauthorized());
    if (!req.auth.role || !roles.includes(req.auth.role)) {
      return next(ApiError.forbidden('เฉพาะเจ้าของระบบเท่านั้นที่ดำเนินการนี้ได้'));
    }
    next();
  };

export const requireOwner = requireRole('owner');

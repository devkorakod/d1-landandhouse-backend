import type { Request, Response, NextFunction, RequestHandler } from 'express';

/** ครอบ async controller เพื่อส่ง error เข้า errorHandler โดยไม่ต้องเขียน try/catch */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { void Promise.resolve(fn(req, res, next)).catch(next); };

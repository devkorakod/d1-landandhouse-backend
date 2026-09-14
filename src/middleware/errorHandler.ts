import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { isProd } from '../config/env.js';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'ไม่พบเส้นทางที่เรียก', messageEn: 'Route not found' },
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || undefined;

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, messageEn: err.messageEn,
               details: err.details, requestId },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง', messageEn: 'Validation failed',
        details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        requestId,
      },
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'รูปแบบรหัสข้อมูลไม่ถูกต้อง', requestId },
    });
  }

  if (typeof err === 'object' && err && (err as { code?: number }).code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_KEY', message: 'ข้อมูลนี้มีอยู่ในระบบแล้ว', requestId },
    });
  }

  logger.error({ err, requestId, url: req.originalUrl }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'เกิดข้อผิดพลาดภายในระบบ',
      messageEn: 'Internal server error',
      ...(isProd ? {} : { debug: String(err) }),
      requestId,
    },
  });
}

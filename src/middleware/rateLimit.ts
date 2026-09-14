import rateLimit from 'express-rate-limit';

const json = (message: string) => ({
  success: false,
  error: { code: 'RATE_LIMITED', message, messageEn: 'Too many requests' },
});

export const publicReadLimiter = rateLimit({
  windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false,
  message: json('คำขอถี่เกินไป กรุณารอสักครู่'),
});

export const leadLimiter = rateLimit({
  windowMs: 10 * 60_000, limit: 5,
  message: json('ส่งฟอร์มถี่เกินไป กรุณารอสักครู่แล้วลองใหม่'),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60_000, limit: 10, skipSuccessfulRequests: true,
  message: json('พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาที'),
});

export const adminWriteLimiter = rateLimit({ windowMs: 60_000, limit: 300 });

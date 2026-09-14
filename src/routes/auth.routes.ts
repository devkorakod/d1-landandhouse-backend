import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, optionalAuth } from '../middleware/authenticate.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { loginSchema } from '../modules/auth/auth.schema.js';
import { login, refresh, logout } from '../modules/auth/auth.service.js';
import { User } from '../models/index.js';
import { isProd } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const authRouter = Router();

const REFRESH_COOKIE = 'refreshToken';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/api/v1/admin/auth',
  maxAge: 7 * 24 * 3600_000,
};

authRouter.post('/login', loginLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await login(email, password, { ip: req.ip, userAgent: req.get('user-agent') ?? undefined });
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('กรุณาเข้าสู่ระบบใหม่');
  const result = await refresh(token, { ip: req.ip, userAgent: req.get('user-agent') ?? undefined });
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
  res.json({ success: true, data: { accessToken: result.accessToken } });
}));

authRouter.post('/logout', optionalAuth, asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (req.auth?.sub && token) await logout(req.auth.sub, token);
  res.clearCookie(REFRESH_COOKIE, { path: cookieOptions.path });
  res.json({ success: true, data: null });
}));

authRouter.get('/me', authenticate('staff'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth!.sub).lean();
  if (!user) throw ApiError.notFound('ไม่พบผู้ใช้งาน');
  res.json({
    success: true,
    data: { id: String(user._id), email: user.email, name: user.name, role: user.role, isAgent: user.isAgent },
  });
}));

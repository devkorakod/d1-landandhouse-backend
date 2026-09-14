import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { User } from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import type { UserRole } from '../../types/index.js';

const LOCK_MINUTES = 15;
const MAX_FAIL_COUNT = 5;

export interface AccessPayload {
  sub: string;
  realm: 'staff';
  role: UserRole;
  email: string;
}

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES as any });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES as any });
}

export interface AuthContext { ip?: string; userAgent?: string }

export async function login(email: string, password: string, ctx: AuthContext) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

  if (user.status !== 'active') throw ApiError.forbidden('บัญชีนี้ถูกระงับการใช้งาน');

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    throw ApiError.forbidden(`บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ภายหลัง`);
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    user.loginFailCount = (user.loginFailCount ?? 0) + 1;
    if (user.loginFailCount >= MAX_FAIL_COUNT) {
      user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
      user.loginFailCount = 0;
    }
    await user.save();
    throw ApiError.unauthorized('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }

  user.loginFailCount = 0;
  user.lastLoginAt = new Date();

  const refreshToken = signRefreshToken(String(user._id));
  user.refreshTokens = [
    ...(user.refreshTokens ?? []).filter((t: any) => t.expiresAt > new Date()),
    {
      tokenHash: hashToken(refreshToken),
      userAgent: ctx.userAgent,
      ip: ctx.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
    },
  ];
  await user.save();

  const accessToken = signAccessToken({
    sub: String(user._id), realm: 'staff', role: user.role, email: user.email,
  });

  return {
    accessToken,
    refreshToken,
    user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
  };
}

export async function refresh(refreshToken: string, ctx: AuthContext) {
  let decoded: { sub: string };
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw ApiError.unauthorized('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw ApiError.unauthorized();

  const hash = hashToken(refreshToken);
  const stored = (user.refreshTokens ?? []).find((t: any) => t.tokenHash === hash);
  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
  }

  // หมุนเวียน refresh token (revoke อันเก่า ออกอันใหม่)
  const newRefreshToken = signRefreshToken(String(user._id));
  user.refreshTokens = [
    ...(user.refreshTokens ?? []).filter((t: any) => t.tokenHash !== hash && t.expiresAt > new Date()),
    {
      tokenHash: hashToken(newRefreshToken),
      userAgent: ctx.userAgent,
      ip: ctx.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
    },
  ];
  await user.save();

  const accessToken = signAccessToken({
    sub: String(user._id), realm: 'staff', role: user.role, email: user.email,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string, refreshToken?: string) {
  if (!refreshToken) return;
  const user = await User.findById(userId);
  if (!user) return;
  const hash = hashToken(refreshToken);
  user.refreshTokens = (user.refreshTokens ?? []).filter((t: any) => t.tokenHash !== hash);
  await user.save();
}

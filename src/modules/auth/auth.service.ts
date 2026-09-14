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
    const failCount = (user.loginFailCount ?? 0) + 1;
    const update = failCount >= MAX_FAIL_COUNT
      ? { loginFailCount: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) }
      : { loginFailCount: failCount };
    // atomic update — ไม่ใช้ findById+save เพราะแข่งกับ request อื่นแล้วชน optimistic version ได้
    await User.updateOne({ _id: user._id }, { $set: update });
    throw ApiError.unauthorized('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }

  const refreshToken = signRefreshToken(String(user._id));
  await User.updateOne({ _id: user._id }, {
    $set: { loginFailCount: 0, lastLoginAt: new Date() },
    $push: {
      refreshTokens: {
        $each: [{
          tokenHash: hashToken(refreshToken),
          userAgent: ctx.userAgent,
          ip: ctx.ip,
          expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
        }],
        $slice: -10, // เก็บ session ล่าสุดไว้ไม่เกิน 10 อุปกรณ์ ตัดอันเก่า/หมดอายุทิ้งไปเอง
      },
    },
  });

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

  const hash = hashToken(refreshToken);
  const newRefreshToken = signRefreshToken(decoded.sub);

  // หมุนเวียน token แบบ atomic ในคำสั่งเดียว (positional $) — ไม่ต้อง findById+save
  // ถ้ามี request คู่แข่งใช้ refresh token ตัวเดิมพร้อมกัน จะมีแค่ตัวเดียวที่แมตช์และชนะ
  // ส่วนตัวที่แพ้จะไม่พบเอกสาร (เพราะ tokenHash ถูกแทนที่ไปแล้ว) แล้วได้ 401 ตามปกติ ไม่ใช่ 500
  const user = await User.findOneAndUpdate(
    {
      _id: decoded.sub,
      refreshTokens: { $elemMatch: { tokenHash: hash, expiresAt: { $gt: new Date() } } },
    },
    {
      $set: {
        'refreshTokens.$.tokenHash': hashToken(newRefreshToken),
        'refreshTokens.$.userAgent': ctx.userAgent,
        'refreshTokens.$.ip': ctx.ip,
        'refreshTokens.$.expiresAt': new Date(Date.now() + 7 * 24 * 3600_000),
      },
    },
    { new: true },
  );
  if (!user) throw ApiError.unauthorized('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');

  const accessToken = signAccessToken({
    sub: String(user._id), realm: 'staff', role: user.role, email: user.email,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string, refreshToken?: string) {
  if (!refreshToken) return;
  await User.updateOne(
    { _id: userId },
    { $pull: { refreshTokens: { tokenHash: hashToken(refreshToken) } } },
  );
}

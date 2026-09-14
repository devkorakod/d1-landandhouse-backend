import { User, hashPassword } from '../models/index.js';
import { logger } from '../config/logger.js';

export async function seedOwner() {
  const email = process.env.SEED_OWNER_EMAIL ?? 'owner@example.com';
  const password = process.env.SEED_OWNER_PASSWORD ?? 'ChangeMe123!';

  const existing = await User.findOne({ email });
  if (existing) { logger.info('มีบัญชี Owner อยู่แล้ว — ข้าม'); return; }

  await User.create({
    email,
    passwordHash: await hashPassword(password),
    name: 'เจ้าของระบบ',
    role: 'owner',
    status: 'active',
    isAgent: false,
  });
  logger.info({ email }, '👤 สร้างบัญชี Owner แล้ว — กรุณาเปลี่ยนรหัสผ่านทันที');
}

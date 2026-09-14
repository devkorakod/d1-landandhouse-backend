import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173')
    .transform((v) => v.split(',').map((s) => s.trim())),

  MONGODB_URI: z.string().min(1, 'ต้องตั้งค่า MONGODB_URI'),

  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  UPLOAD_DIR: z.string().default('uploads'),
  STORAGE_PUBLIC_URL: z.string().default('http://localhost:4000/uploads'),

  SEED_OWNER_EMAIL: z.string().default('owner@d1landandhouse.co.th'),
  SEED_OWNER_PASSWORD: z.string().default('ChangeMe123!'),

  LOG_LEVEL: z.string().default('info'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ ตัวแปรสภาพแวดล้อมไม่ถูกต้อง:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';

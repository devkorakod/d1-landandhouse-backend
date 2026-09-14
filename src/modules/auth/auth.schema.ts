import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
}).strict();

export type LoginInput = z.infer<typeof loginSchema>;

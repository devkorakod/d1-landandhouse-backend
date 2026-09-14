import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { User, hashPassword } from '../models/index.js';
import { requireOwner } from '../middleware/requireRole.js';

export const userAdminRouter = Router();

userAdminRouter.get('/', asyncHandler(async (_req, res) => {
  const users = await User.find().select('name email role status isAgent phone lineId avatar').lean();
  res.json({ success: true, data: users });
}));

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร'),
  name: z.string().min(1),
  role: z.enum(['owner', 'admin']).default('admin'),
  isAgent: z.boolean().default(true),
  phone: z.string().optional(),
  lineId: z.string().optional(),
}).strict();

userAdminRouter.post('/', requireOwner, validate(createSchema), asyncHandler(async (req, res) => {
  const input = req.body as z.infer<typeof createSchema>;
  const exists = await User.findOne({ email: input.email.toLowerCase() });
  if (exists) throw ApiError.conflict('EMAIL_TAKEN', 'อีเมลนี้ถูกใช้งานแล้ว');
  const user = await User.create({
    ...input, email: input.email.toLowerCase(), passwordHash: await hashPassword(input.password),
  });
  res.status(201).json({
    success: true,
    data: { id: String(user._id), email: user.email, name: user.name, role: user.role },
  });
}));

userAdminRouter.patch('/:id/status', requireOwner,
  validate(z.object({ status: z.enum(['active', 'suspended']) })),
  asyncHandler(async (req, res) => {
    const target = await User.findById(req.params.id);
    if (!target) throw ApiError.notFound('ไม่พบผู้ใช้งาน');
    if (req.body.status === 'suspended' && target.role === 'owner') {
      const activeOwners = await User.countDocuments({ role: 'owner', status: 'active' });
      if (activeOwners <= 1) {
        throw ApiError.conflict('LAST_OWNER', 'ต้องมีบัญชี Owner ที่ใช้งานอยู่อย่างน้อย 1 บัญชีเสมอ');
      }
    }
    target.status = req.body.status;
    await target.save();
    res.json({ success: true, data: { id: String(target._id), status: target.status } });
  }));

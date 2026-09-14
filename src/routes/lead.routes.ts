import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { Lead } from '../models/index.js';
import { leadStatusUpdateSchema } from '../types/index.js';
import { requireOwner } from '../middleware/requireRole.js';

export const leadAdminRouter = Router();

leadAdminRouter.get('/', asyncHandler(async (req, res) => {
  const { status, assignedTo, page = '1', limit = '30' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = { deletedAt: null };
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  const p = Number(page); const l = Math.min(100, Number(limit));
  const [items, total] = await Promise.all([
    Lead.find(filter).sort('-createdAt').skip((p - 1) * l).limit(l)
      .populate('assignedTo', 'name email').lean(),
    Lead.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) || 1 } });
}));

leadAdminRouter.get('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, deletedAt: null })
    .populate('assignedTo', 'name email').lean();
  if (!lead) throw ApiError.notFound('ไม่พบลีดที่ต้องการ');
  res.json({ success: true, data: lead });
}));

leadAdminRouter.patch('/:id/status', validate(leadStatusUpdateSchema), asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, deletedAt: null });
  if (!lead) throw ApiError.notFound('ไม่พบลีดที่ต้องการ');
  const { status, lostReason } = req.body as z.infer<typeof leadStatusUpdateSchema>;
  lead.status = status;
  if (lostReason) lead.lostReason = lostReason;
  lead.updatedBy = req.auth?.sub as any;
  await lead.save();
  res.json({ success: true, data: lead });
}));

leadAdminRouter.patch('/:id/assign', validate(z.object({ assignedTo: z.string().nullable() })),
  asyncHandler(async (req, res) => {
    const lead = await Lead.findOne({ _id: req.params.id, deletedAt: null });
    if (!lead) throw ApiError.notFound('ไม่พบลีดที่ต้องการ');
    lead.assignedTo = req.body.assignedTo;
    lead.assignedAt = req.body.assignedTo ? new Date() : undefined;
    await lead.save();
    res.json({ success: true, data: lead });
  }));

leadAdminRouter.delete('/:id', requireOwner, asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, deletedAt: null });
  if (!lead) throw ApiError.notFound('ไม่พบลีดที่ต้องการ');
  lead.deletedAt = new Date();
  lead.deletedBy = req.auth?.sub as any;
  await lead.save();
  res.json({ success: true, data: null });
}));

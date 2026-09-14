import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireOwner } from '../middleware/requireRole.js';
import { adminWriteLimiter } from '../middleware/rateLimit.js';
import { authRouter } from './auth.routes.js';
import { propertyAdminRouter } from './property.routes.js';
import { projectAdminRouter } from './project.routes.js';
import { leadAdminRouter } from './lead.routes.js';
import { mediaAdminRouter } from './media.routes.js';
import { promotionAdminRouter } from './promotion.routes.js';
import { settingsAdminRouter } from './settings.routes.js';
import { userAdminRouter } from './user.routes.js';

export const adminRouter = Router();

// login/refresh ไม่ต้องผ่าน authenticate — /me และ /logout เช็คภายในไฟล์เอง
adminRouter.use('/auth', authRouter);

adminRouter.use(authenticate('staff'));
adminRouter.use(adminWriteLimiter);

adminRouter.use('/properties', propertyAdminRouter);
adminRouter.use('/projects', projectAdminRouter);
adminRouter.use('/leads', leadAdminRouter);
adminRouter.use('/media', mediaAdminRouter);
adminRouter.use('/promotions', promotionAdminRouter);
adminRouter.use('/settings', settingsAdminRouter);
adminRouter.use('/users', userAdminRouter);

adminRouter.get('/ping', (req, res) => {
  res.json({ success: true, data: { role: req.auth?.role, at: new Date().toISOString() } });
});
adminRouter.get('/owner-only', requireOwner, (_req, res) => {
  res.json({ success: true, data: 'owner ok' });
});

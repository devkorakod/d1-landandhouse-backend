import { Router } from 'express';
import { publicReadLimiter, leadLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { leadCreateSchema } from '../types/index.js';
import { createLead } from '../modules/lead/lead.service.js';
import { propertyPublicRouter } from './property.routes.js';
import { projectPublicRouter } from './project.routes.js';
import { promotionPublicRouter } from './promotion.routes.js';
import { settingsPublicRouter } from './settings.routes.js';
import { pagePublicRouter } from './page.routes.js';
import { alertPublicRouter } from './alert.routes.js';
import { agentPublicRouter } from './agent.routes.js';

export const publicRouter = Router();

publicRouter.use(publicReadLimiter);

publicRouter.use('/properties', propertyPublicRouter);
publicRouter.use('/projects', projectPublicRouter);
publicRouter.use('/promotions', promotionPublicRouter);
publicRouter.use('/settings', settingsPublicRouter);
publicRouter.use('/pages', pagePublicRouter);
publicRouter.use('/property-alerts', alertPublicRouter);
publicRouter.use('/agents', agentPublicRouter);

publicRouter.post('/leads', leadLimiter, validate(leadCreateSchema),
  asyncHandler(async (req, res) => {
    const lead = await createLead(req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.status(201).json({
      success: true,
      data: {
        refNo: lead.refNo,
        message: {
          th: 'ขอบคุณค่ะ ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง',
          en: 'Thank you. Our team will contact you within 24 hours.',
        },
      },
    });
  }));

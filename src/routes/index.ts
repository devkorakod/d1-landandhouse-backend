import { Router } from 'express';
import { publicRouter } from './public.routes.js';
import { adminRouter } from './admin.routes.js';

export const apiRouter = Router();
apiRouter.use('/public', publicRouter);
apiRouter.use('/admin', adminRouter);

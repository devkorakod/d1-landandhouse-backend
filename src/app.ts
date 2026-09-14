import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { env, isProd } from './config/env.js';
import { logger } from './config/logger.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(pinoHttp({ logger, genReqId: (req) => (req.headers['x-request-id'] as string) }));
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

  app.get('/healthz', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  if (!isProd) {
    try {
      const spec = parse(readFileSync(new URL('../docs/openapi.yaml', import.meta.url), 'utf8'));
      app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
    } catch { logger.warn('ไม่พบไฟล์ docs/openapi.yaml — ข้ามการเปิด /docs'); }
  }

  app.use('/api/v1', apiRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

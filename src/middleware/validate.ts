import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

type Source = 'body' | 'query' | 'params';

/** ตรวจ input ด้วย Zod แล้วเขียนค่าที่ผ่านการแปลงกลับเข้า req */
export const validate =
  (schema: ZodSchema, source: Source = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    // เขียนทับค่าที่ผ่านการ transform แล้ว (req.query/params เป็น readonly ในบาง type)
    Object.defineProperty(req, source, { value: result.data, writable: true, configurable: true });
    next();
  };

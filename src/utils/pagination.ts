import type { Query } from 'mongoose';

export interface PageOptions { page: number; limit: number; sort?: string }

export async function paginate<T>(query: Query<T[], T>, opts: PageOptions) {
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(100, Math.max(1, opts.limit || 12));
  const skip = (page - 1) * limit;

  // ห้ามใส่ .limit(0) ก่อน countDocuments() — MongoDB ปฏิเสธ limit เป็น 0 กับคำสั่ง count
  const countQuery = query.clone();
  const [items, total] = await Promise.all([
    query.sort(opts.sort || '-createdAt').skip(skip).limit(limit).lean(),
    countQuery.countDocuments(),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1, sort: opts.sort },
  };
}

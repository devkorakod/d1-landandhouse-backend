import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { Project, Property } from '../models/index.js';
import { paginate } from '../utils/pagination.js';
import { resolveMediaRef, resolveMediaRefs } from '../modules/property/property.service.js';
import { projectUpsertSchema } from '../modules/project/project.schema.js';
import { slugify, uniqueSlug } from '../helpers/index.js';

export const projectPublicRouter = Router();
export const projectAdminRouter = Router();

function toPublicProject(p: any) {
  return {
    id: String(p._id), slug: p.slug, name: p.name, developer: p.developer,
    projectType: p.projectType, constructionStatus: p.constructionStatus,
    completionDate: p.completionDate, description: p.description,
    location: p.location, totalUnits: p.totalUnits, totalBuildings: p.totalBuildings,
    priceRange: p.priceRange, unitTypes: p.unitTypes, coverImage: p.coverImage,
    gallery: p.gallery, commonFee: p.commonFee, sinkingFund: p.sinkingFund,
    foreignQuotaAvailable: p.foreignQuotaAvailable, isFeatured: p.isFeatured,
    seo: p.seo,
  };
}

// ── Public ───────────────────────────────────────────────
projectPublicRouter.get('/', asyncHandler(async (req, res) => {
  const filter = { status: 'published', deletedAt: null };
  const { items, meta } = await paginate(Project.find(filter), {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 12,
    sort: '-isFeatured -sortWeight -publishedAt',
  });
  res.json({ success: true, data: items.map(toPublicProject), meta });
}));

projectPublicRouter.get('/:slug', asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, status: 'published', deletedAt: null }).lean();
  if (!project) throw ApiError.notFound('ไม่พบโครงการที่ต้องการ');
  const units = await Property.find({ projectId: project._id, status: 'published', deletedAt: null })
    .select('code slug title price area spec coverImage listingType').lean();
  res.json({ success: true, data: { ...toPublicProject(project), units } });
}));

// ── Admin ────────────────────────────────────────────────
projectAdminRouter.get('/', asyncHandler(async (req, res) => {
  const items = await Project.find({ deletedAt: null }).sort('-createdAt').lean();
  res.json({ success: true, data: items });
}));

projectAdminRouter.get('/:id', asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null }).lean();
  if (!project) throw ApiError.notFound('ไม่พบโครงการที่ต้องการ');
  res.json({ success: true, data: project });
}));

async function buildProjectDoc(input: z.infer<typeof projectUpsertSchema>, existing?: any) {
  const [coverImage, gallery] = await Promise.all([
    input.coverImageId ? resolveMediaRef(input.coverImageId) : existing?.coverImage,
    input.galleryIds !== undefined ? resolveMediaRefs(input.galleryIds) : existing?.gallery,
  ]);
  const priceRange = input.unitTypes?.length
    ? {
        min: Math.min(...input.unitTypes.map((u) => u.priceFrom ?? Infinity).filter(Number.isFinite)),
        max: Math.max(...input.unitTypes.map((u) => u.priceFrom ?? 0)),
      }
    : existing?.priceRange;

  return {
    name: input.name, developer: input.developer, projectType: input.projectType,
    status: input.status, constructionStatus: input.constructionStatus,
    completionDate: input.completionDate, description: input.description,
    location: input.location, totalUnits: input.totalUnits, totalBuildings: input.totalBuildings,
    totalFloors: input.totalFloors, totalRai: input.totalRai, unitTypes: input.unitTypes,
    coverImage, gallery, commonFee: input.commonFee, sinkingFund: input.sinkingFund,
    foreignQuotaAvailable: input.foreignQuotaAvailable, isFeatured: input.isFeatured,
    sortWeight: input.sortWeight, seo: input.seo, priceRange,
  };
}

projectAdminRouter.post('/', validate(projectUpsertSchema), asyncHandler(async (req, res) => {
  const input = req.body as z.infer<typeof projectUpsertSchema>;
  const slug = input.slug || await uniqueSlug(slugify(input.name.en || input.name.th),
    async (s) => !!(await Project.exists({ slug: s })));
  const doc = await buildProjectDoc(input);
  const project = await Project.create({ ...doc, slug, createdBy: req.auth?.sub, updatedBy: req.auth?.sub });
  res.status(201).json({ success: true, data: project });
}));

projectAdminRouter.patch('/:id', validate(projectUpsertSchema.partial()), asyncHandler(async (req, res) => {
  const existing = await Project.findOne({ _id: req.params.id, deletedAt: null });
  if (!existing) throw ApiError.notFound('ไม่พบโครงการที่ต้องการ');
  const input = req.body as Partial<z.infer<typeof projectUpsertSchema>>;
  const doc = await buildProjectDoc({ ...existing.toObject(), ...input } as any, existing);
  Object.assign(existing, doc, { updatedBy: req.auth?.sub });
  await existing.save();
  res.json({ success: true, data: existing.toObject() });
}));

projectAdminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null });
  if (!project) throw ApiError.notFound('ไม่พบโครงการที่ต้องการ');
  project.deletedAt = new Date();
  project.deletedBy = req.auth?.sub as any;
  await project.save();
  res.json({ success: true, data: null });
}));

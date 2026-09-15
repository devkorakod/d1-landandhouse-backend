import { Schema, model, Types } from 'mongoose';
import { PROJECT_TYPE, CONSTRUCTION_STATUS } from '../types/index.js';
import {
  LocalizedStringSchema, LocalizedTextSchema, MediaRefSchema,
  GeoPointSchema, SeoMetaSchema, VideoSchema, auditFields,
} from './shared/index.js';

const projectSchema = new Schema({
  slug: { type: String, required: true, unique: true, lowercase: true },
  name: { type: LocalizedStringSchema, required: true },
  developer: LocalizedStringSchema,
  projectType: { type: String, enum: PROJECT_TYPE, required: true },
  status: { type: String, enum: ['draft', 'published', 'hidden'], default: 'draft' },
  constructionStatus: { type: String, enum: CONSTRUCTION_STATUS, default: 'planning' },
  completionDate: Date,
  description: LocalizedTextSchema,

  location: {
    address: LocalizedStringSchema,
    provinceId: { type: Types.ObjectId, ref: 'Location' },
    districtId: { type: Types.ObjectId, ref: 'Location' },
    zone: String,
    zoneEn: String,
    postalCode: String,
    geo: GeoPointSchema,
  },

  totalUnits: Number,
  totalBuildings: Number,
  totalFloors: Number,
  totalRai: Number,
  priceRange: { min: Number, max: Number },
  unitTypes: [{
    name: LocalizedStringSchema,
    sizeSqmMin: Number, sizeSqmMax: Number, bedrooms: Number,
    priceFrom: Number, floorPlan: MediaRefSchema,
  }],
  facilities: [{ type: Types.ObjectId, ref: 'Amenity' }],
  masterPlan: [MediaRefSchema],
  coverImage: MediaRefSchema,
  gallery: [MediaRefSchema],
  videos: [VideoSchema],
  nearby: [{
    type: String, name: LocalizedStringSchema, distanceKm: Number, travelMinutes: Number,
  }],
  commonFee: Number,
  sinkingFund: Number,
  foreignQuotaAvailable: Boolean,

  isFeatured: { type: Boolean, default: false },
  sortWeight: { type: Number, default: 0 },
  publishedAt: Date,
  seo: SeoMetaSchema,
  ...auditFields,
}, { timestamps: true });

projectSchema.index({ status: 1, deletedAt: 1 });
projectSchema.index({ 'location.geo': '2dsphere' });
projectSchema.index({ isFeatured: -1, sortWeight: -1 });

projectSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Project = model('Project', projectSchema);

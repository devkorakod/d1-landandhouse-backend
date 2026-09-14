import { Schema, model, Types, type Document } from 'mongoose';
import {
  PROPERTY_TYPE, LISTING_TYPE, PROPERTY_STATUS, OWNERSHIP, TITLE_DEED,
  FURNISHING, DIRECTION, VIEW_TYPE, NEARBY_TYPE,
} from '../types/index.js';
import { thaiAreaToSqm } from '../helpers/index.js';
import {
  LocalizedStringSchema, LocalizedTextSchema, MediaRefSchema,
  GeoPointSchema, SeoMetaSchema, VideoSchema, auditFields,
} from './shared/index.js';

const propertySchema = new Schema({
  code: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  title: { type: LocalizedStringSchema, required: true },
  description: LocalizedTextSchema,
  highlights: [LocalizedStringSchema],

  propertyType: { type: String, enum: PROPERTY_TYPE, required: true },
  listingType: { type: String, enum: LISTING_TYPE, required: true },
  status: { type: String, enum: PROPERTY_STATUS, default: 'draft' },
  projectId: { type: Types.ObjectId, ref: 'Project', default: null },

  price: {
    sale: Number,
    rentMonthly: Number,
    pricePerSqm: Number,
    currency: { type: String, default: 'THB' },
    hidePrice: { type: Boolean, default: false },
    negotiable: { type: Boolean, default: false },
  },

  area: {
    usableSqm: Number,
    landRai: { type: Number, default: 0 },
    landNgan: { type: Number, default: 0 },
    landWah: { type: Number, default: 0 },
    landSqm: { type: Number, default: 0 },
    frontageM: Number,
    depthM: Number,
  },

  spec: {
    bedrooms: Number, bathrooms: Number, parking: Number,
    floors: Number, floorNo: Number, unitNo: String, buildingName: String,
    direction: { type: String, enum: DIRECTION },
    view: [{ type: String, enum: VIEW_TYPE }],
    furnishing: { type: String, enum: FURNISHING },
    yearBuilt: Number,
    condition: { type: String, enum: ['new', 'excellent', 'good', 'renovate'] },
    ownership: { type: String, enum: OWNERSHIP },
    leaseYearsRemaining: Number,
    titleDeedType: { type: String, enum: TITLE_DEED },
  },

  location: {
    address: LocalizedStringSchema,
    provinceId: { type: Types.ObjectId, ref: 'Location' },
    districtId: { type: Types.ObjectId, ref: 'Location' },
    subdistrictId: { type: Types.ObjectId, ref: 'Location' },
    zone: String,
    postalCode: String,
    geo: GeoPointSchema,
    hideExactLocation: { type: Boolean, default: false },
  },

  nearby: [{
    type: { type: String, enum: NEARBY_TYPE },
    name: LocalizedStringSchema,
    distanceKm: Number,
    travelMinutes: Number,
  }],

  amenities: [{ type: Types.ObjectId, ref: 'Amenity' }],

  coverImage: MediaRefSchema,
  gallery: [MediaRefSchema],
  floorPlans: [MediaRefSchema],
  videos: [VideoSchema],
  virtualTours: [{
    provider: { type: String, enum: ['matterport', 'kuula', 'custom'] },
    embedUrl: String,
    title: LocalizedStringSchema,
  }],
  documents: [{
    mediaId: { type: Types.ObjectId, ref: 'Media' },
    label: LocalizedStringSchema,
    isPublic: { type: Boolean, default: false },
  }],

  agentId: { type: Types.ObjectId, ref: 'User' },
  // ── ข้อมูลภายใน ห้ามส่งออก public API ──
  ownerContact: { name: String, phone: String, note: String },
  commissionNote: String,

  isFeatured: { type: Boolean, default: false },
  isHot: { type: Boolean, default: false },
  sortWeight: { type: Number, default: 0 },
  publishedAt: Date,
  expiresAt: Date,

  stats: {
    views: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },

  seo: SeoMetaSchema,
  tags: [String],
  ...auditFields,
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────
propertySchema.index({ status: 1, deletedAt: 1, publishedAt: -1 });
propertySchema.index({ propertyType: 1, listingType: 1, status: 1 });
propertySchema.index({ 'price.sale': 1 });
propertySchema.index({ 'price.rentMonthly': 1 });
propertySchema.index({ 'location.provinceId': 1, 'location.districtId': 1 });
propertySchema.index({ 'location.geo': '2dsphere' });
propertySchema.index({ projectId: 1 });
propertySchema.index({ isFeatured: -1, sortWeight: -1, publishedAt: -1 });
propertySchema.index({
  'title.th': 'text', 'title.en': 'text',
  'description.th': 'text', 'location.zone': 'text', code: 'text',
}, { name: 'property_text', weights: { 'title.th': 10, 'title.en': 10, code: 8 } });

// ── Hooks ────────────────────────────────────────────────
propertySchema.pre('save', function (next) {
  const a = this.area;
  if (a) {
    a.landSqm = thaiAreaToSqm(a.landRai ?? 0, a.landNgan ?? 0, a.landWah ?? 0);
  }
  if (this.price?.sale && this.area?.usableSqm) {
    this.price.pricePerSqm = Math.round(this.price.sale / this.area.usableSqm);
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export interface IProperty extends Document { [key: string]: any }
export const Property = model('Property', propertySchema);

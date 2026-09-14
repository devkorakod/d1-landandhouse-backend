import { Schema, model, Types } from 'mongoose';
import {
  LEAD_SOURCE, LEAD_STATUS, LEAD_INTENT, LOST_REASON,
  CONTACT_CHANNEL, PREFERRED_TIME,
} from '../types/index.js';
import { LocalizedStringSchema, auditFields } from './shared/index.js';

const leadSchema = new Schema({
  refNo: { type: String, required: true, unique: true },
  source: { type: String, enum: LEAD_SOURCE, required: true },
  sourceUrl: String,

  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: String,
  lineId: String,
  preferredChannel: { type: String, enum: CONTACT_CHANNEL, default: 'phone' },
  preferredTime: { type: String, enum: PREFERRED_TIME, default: 'anytime' },
  intent: { type: String, enum: LEAD_INTENT, required: true },
  message: String,
  budget: { min: Number, max: Number },
  interestedTypes: [String],
  interestedZones: [String],

  propertyId: { type: Types.ObjectId, ref: 'Property', default: null },
  projectId: { type: Types.ObjectId, ref: 'Project', default: null },
  promotionId: { type: Types.ObjectId, ref: 'Promotion', default: null },
  customerId: { type: Types.ObjectId, ref: 'Customer', default: null },
  // เก็บสำเนาไว้เผื่อทรัพย์ถูกลบภายหลัง
  propertySnapshot: {
    code: String, title: LocalizedStringSchema, price: Number, coverUrl: String,
  },

  // ── CRM ──
  status: { type: String, enum: LEAD_STATUS, default: 'new', index: true },
  lostReason: { type: String, enum: LOST_REASON },
  assignedTo: { type: Types.ObjectId, ref: 'User', default: null },
  assignedAt: Date,
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  rating: { type: Number, min: 1, max: 5 },
  tags: [String],
  nextFollowUpAt: Date,
  boardOrder: { type: Number, default: 0 },
  statusChangedAt: { type: Date, default: Date.now },
  firstResponseAt: Date,
  closedAt: Date,
  dealValue: Number,

  // ── PDPA ──
  consent: {
    acceptedAt: Date, ip: String, userAgent: String, policyVersion: String,
  },
  utm: { source: String, medium: String, campaign: String, term: String, content: String },
  isDuplicateOf: { type: Types.ObjectId, ref: 'Lead', default: null },
  ...auditFields,
}, { timestamps: true });

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ phone: 1, createdAt: -1 });
leadSchema.index({ propertyId: 1 });
leadSchema.index({ nextFollowUpAt: 1 });
leadSchema.index({ source: 1 });

leadSchema.pre('save', function (next) {
  if (this.isModified('status')) this.statusChangedAt = new Date();
  if (this.isModified('status') && ['won', 'lost'].includes(this.status as string)) {
    this.closedAt = new Date();
  }
  next();
});

export const Lead = model('Lead', leadSchema);

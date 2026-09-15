import { Schema, model } from 'mongoose';

const propertyAlertSchema = new Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  propertyType: String,
  listingType: String,
  zone: String,
  minPrice: Number,
  maxPrice: Number,
  active: { type: Boolean, default: true },
  lastNotifiedAt: Date,
}, { timestamps: true });

propertyAlertSchema.index({ email: 1, createdAt: -1 });
propertyAlertSchema.index({ active: 1 });

export const PropertyAlert = model('PropertyAlert', propertyAlertSchema);

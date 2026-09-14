import { Schema, model, type Document, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLE, type UserRole } from '../types/index.js';
import { LocalizedTextSchema, MediaRefSchema } from './shared/index.js';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  lineId?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  isAgent: boolean;
  lastLoginAt?: Date;
  loginFailCount: number;
  lockedUntil?: Date;
  avatar?: unknown;
  bio?: { th: string; en?: string };
  refreshTokens: { tokenHash: string; userAgent?: string; ip?: string; expiresAt: Date }[];
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  name: { type: String, required: true, trim: true },
  phone: String,
  lineId: String,
  avatar: MediaRefSchema,
  role: { type: String, enum: USER_ROLE, required: true, default: 'admin' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  isAgent: { type: Boolean, default: true },
  bio: LocalizedTextSchema,
  lastLoginAt: Date,
  loginFailCount: { type: Number, default: 0 },
  lockedUntil: Date,
  refreshTokens: [{
    tokenHash: String, userAgent: String, ip: String, expiresAt: Date,
  }],
}, { timestamps: true });

userSchema.index({ role: 1, status: 1 });

userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);

export const User = model<IUser>('User', userSchema);

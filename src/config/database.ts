import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDatabase(uri = env.MONGODB_URI) {
  mongoose.set('strictQuery', true);
  mongoose.connection.on('connected', () => logger.info('MongoDB เชื่อมต่อแล้ว'));
  mongoose.connection.on('error', (e) => logger.error({ err: e }, 'MongoDB error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB หลุดการเชื่อมต่อ'));

  await mongoose.connect(uri, {
    dbName: 'd1landandhouse',
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10_000,
  });
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

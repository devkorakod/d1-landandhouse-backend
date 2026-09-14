import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../config/logger.js';
import { seedOwner } from './seed-owner.js';
import { seedAmenities } from './seed-amenities.js';
import { seedSampleProperties } from './seed-sample-properties.js';

async function main() {
  await connectDatabase();
  await seedOwner();
  await seedAmenities();
  await seedSampleProperties();
  logger.info('✅ Seed เสร็จสิ้น');
  await disconnectDatabase();
}

main().catch((e) => { logger.error({ err: e }, 'Seed ล้มเหลว'); process.exit(1); });

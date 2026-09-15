import { User, Property } from '../../models/index.js';
import { attachPromotions } from '../promotion/promotion.service.js';
import { toPublicListItem } from '../property/property.serializer.js';

export async function getPublicAgentWithListings(id: string) {
  const agent = await User.findOne({ _id: id, isAgent: true, status: 'active' })
    .select('name phone lineId avatar bio').lean();
  if (!agent) return null;

  const properties = await Property.find({ agentId: id, status: 'published', deletedAt: null })
    .populate('projectId', 'name slug')
    .sort('-publishedAt').limit(50).lean();
  const withPromotions = await attachPromotions(properties as any[]);

  return { agent, properties: withPromotions.map(toPublicListItem) };
}

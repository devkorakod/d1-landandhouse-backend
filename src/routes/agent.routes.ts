import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { getPublicAgentWithListings } from '../modules/agent/agent.service.js';

export const agentPublicRouter = Router();

agentPublicRouter.get('/:id', asyncHandler(async (req, res) => {
  const result = await getPublicAgentWithListings(req.params.id);
  if (!result) throw ApiError.notFound('ไม่พบตัวแทนที่ต้องการ');
  const { agent, properties } = result;
  res.json({
    success: true,
    data: {
      id: String(agent._id), name: agent.name, phone: agent.phone, lineId: agent.lineId,
      avatarUrl: (agent.avatar as any)?.variants?.thumb ?? null, bio: agent.bio,
      properties,
    },
  });
}));

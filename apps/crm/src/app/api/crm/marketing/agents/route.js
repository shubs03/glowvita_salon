import { NextResponse } from 'next/server';
import _db from '../../../../../../../../packages/lib/src/db.js';
import MarketingAgent from '../../../../../../../../packages/lib/src/models/Marketing/MarketingAgent.model.js';
import { authMiddlewareCrm } from '../../../../../middlewareCrm.js';

// GET: Fetch active agents
export const GET = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const agents = await MarketingAgent.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json({ success: true, data: agents }, { status: 200 });
  } catch (error) {
    console.error("CRM Get agents error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch agents" }, { status: 500 });
  }
});

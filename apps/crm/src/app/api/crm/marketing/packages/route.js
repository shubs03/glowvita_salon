import { NextResponse } from 'next/server';
import _db from '../../../../../../../../packages/lib/src/db.js';
import MarketingPackage from '../../../../../../../../packages/lib/src/models/Marketing/MarketingPackage.model.js';
import { authMiddlewareCrm } from '../../../../../middlewareCrm.js';

// GET: Fetch active packages
export const GET = authMiddlewareCrm(async (req) => {
  try {
    await _db();
    const packages = await MarketingPackage.find({ isActive: true }).sort({ price: 1 });
    return NextResponse.json({ success: true, data: packages }, { status: 200 });
  } catch (error) {
    console.error("CRM Get packages error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch packages" }, { status: 500 });
  }
});

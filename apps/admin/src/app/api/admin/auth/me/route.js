import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authMiddlewareAdmin } from '@/middlewareAdmin.js';

// GET /api/admin/auth/me
// Returns the current authenticated admin's data AND the raw token value from the
// httpOnly cookie. Used by AuthInitializer to re-hydrate Redux state when localStorage
// is missing (e.g. user cleared it manually).
export const GET = authMiddlewareAdmin(async (req) => {
  const { user } = req;

  // Read the raw token from the httpOnly cookie on the server side.
  // This is safe because this endpoint is itself protected by authMiddlewareAdmin.
  const cookieStore = cookies();
  const token = cookieStore.get('admin_access_token')?.value || null;

  return NextResponse.json({
    success: true,
    token,
    user: {
      _id: user._id,
      emailAddress: user.emailAddress,
      name: user.name,
      roleName: user.roleName,
      permissions: user.permissions || [],
      assignedRegions: user.assignedRegions || [],
      profileImage: user.profileImage,
      selectedRegion: user.assignedRegions?.[0] || null,
    },
  });
}, ['admin', 'SUPER_ADMIN', 'REGIONAL_ADMIN', 'STAFF']);

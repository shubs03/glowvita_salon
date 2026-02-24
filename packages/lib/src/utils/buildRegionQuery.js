import mongoose from 'mongoose';

/**
 * Builds a region query filter based on admin role and selected region
 * 
 * @param {Object} admin - The admin user object from req.user
 * @param {Object} baseQuery - The base query object to merge with region filter
 * @param {string} selectedRegionId - Optional region ID from query params (for Super Admin)
 * @returns {Object} Combined query with region filter
 */
export function buildRegionQuery(admin, baseQuery = {}, selectedRegionId = null) {
  if (!admin) {
    console.error('[buildRegionQuery] No admin user provided');
    return baseQuery;
  }

  const { roleName, assignedRegions } = admin;

  // Helper to safely convert string IDs to ObjectIds for aggregation compatibility
  const toObjectId = (id) => {
    if (id && typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return id;
  };

  console.log('[buildRegionQuery] Input:', {
    roleName,
    assignedRegions,
    selectedRegionId,
    baseQuery
  });

  // Super Admin can see everything or filter by selected region
  if (roleName === "SUPER_ADMIN" || roleName === "superadmin") {
    if (selectedRegionId) {
      console.log('[buildRegionQuery] Super Admin with selected region:', selectedRegionId);
      return {
        ...baseQuery,
        regionId: toObjectId(selectedRegionId)
      };
    }
    console.log('[buildRegionQuery] Super Admin viewing all regions');
    return baseQuery; // No region filter for Super Admin by default
  }

  // Regional Admin is scoped to their assigned regions
  if (assignedRegions && assignedRegions.length > 0) {
    console.log('[buildRegionQuery] Regional Admin scoped to regions:', assignedRegions);
    const objectIdAssignedRegions = assignedRegions.map(toObjectId);

    // If a specific region is selected and it's in their assigned regions, use it
    if (selectedRegionId && assignedRegions.includes(selectedRegionId)) {
      return {
        ...baseQuery,
        regionId: toObjectId(selectedRegionId)
      };
    }

    // Otherwise, scope to all assigned regions
    return {
      ...baseQuery,
      regionId: { $in: objectIdAssignedRegions }
    };
  }

  // Fallback: If no regions assigned, return a query that matches nothing (security first)
  console.warn('[buildRegionQuery] Admin has no assigned regions, returning restrictive query');
  return {
    ...baseQuery,
    regionId: "none" // This will match no documents
  };
}

/**
 * Extracts region ID from request search params
 * 
 * @param {Request} req - The Next.js request object
 * @returns {string|null} The region ID or null
 */
export function getRegionIdFromRequest(req) {
  try {
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get('regionId');
    console.log('[getRegionIdFromRequest] Extracted regionId:', regionId);
    return regionId;
  } catch (error) {
    console.error('[getRegionIdFromRequest] Error extracting regionId:', error);
    return null;
  }
}

/**
 * Convenience function that combines getRegionIdFromRequest and buildRegionQuery
 * 
 * @param {Request} req - The Next.js request object
 * @param {Object} baseQuery - The base query object
 * @returns {Object} Combined query with region filter
 * 
 * @example
 * // In an API route
 * export const GET = authMiddlewareAdmin(async (req) => {
 *   const query = buildRegionQueryFromRequest(req, { status: 'active' });
 *   const vendors = await VendorModel.find(query);
 *   return Response.json(vendors);
 * });
 */
export function buildRegionQueryFromRequest(req, baseQuery = {}) {
  const regionId = getRegionIdFromRequest(req);
  return buildRegionQuery(req.user, baseQuery, regionId);
}

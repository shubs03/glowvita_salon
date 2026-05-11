import mongoose from "mongoose";

/**
 * Safely converts a string to a MongoDB ObjectId if valid.
 * @param {string} id 
 * @returns {mongoose.Types.ObjectId|string}
 */
const toObjectId = (id) => {
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

/**
 * Generates a MongoDB query fragment for region-based scoping.
 * 
 * @param {Object} user - The admin user object (from req.user)
 * @param {string} [selectedRegionId] - Optional region ID selected by Super Admin
 * @returns {Object} Query fragment for Mongoose/MongoDB
 */
export function getRegionQuery(user, selectedRegionId = null) {
  const { roleName, assignedRegions } = user;
  const normalizedSelectedId = (selectedRegionId === 'null' || selectedRegionId === 'undefined' || !selectedRegionId) ? null : selectedRegionId;

  // Helper to safely convert string IDs to ObjectIds for aggregation compatibility
  const toObjectId = (id) => {
    if (!id || id === 'null' || id === 'undefined') return null;
    if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return id;
  };

  // Super Admin can see everything or filter by selected region
  // Super Admin can see everything or filter by selected region
  if (roleName === "SUPER_ADMIN" || roleName === "superadmin") {
    if (normalizedSelectedId) {
      return { regionId: toObjectId(normalizedSelectedId) };
    }
    return {}; // No region filter for Super Admin by default
  }

  // STAFF typically has broad access unless assigned to specific regions
  if (roleName === "STAFF" && (!assignedRegions || assignedRegions.length === 0)) {
    if (normalizedSelectedId) {
      return { regionId: normalizedSelectedId };
    }
    return {};
  }

  // Regional Admin is scoped to their assigned regions
  if (assignedRegions && assignedRegions.length > 0) {
    const objectIdAssignedRegions = assignedRegions.map(toObjectId);

    if (normalizedSelectedId && assignedRegions.includes(normalizedSelectedId)) {
      return { regionId: toObjectId(normalizedSelectedId) };
    }
    return { regionId: { $in: objectIdAssignedRegions } };
  }

  // Fallback: If no regions assigned, return a query that matches nothing (security first)
  // Use a valid but non-existent ObjectId string to avoid "Argument passed in does not match the accepted types"
  return { regionId: "000000000000000000000000" };
}

/**
 * Validates and locks the regionId for create/update operations.
 * 
 * @param {Object} user - The admin user object
 * @param {string} inputRegionId - The region ID from the request body
 * @returns {string|null} The validated regionId to use
 */
export function validateAndLockRegion(user, inputRegionId) {
  const { roleName, assignedRegions } = user;
  const normalizedInputId = (inputRegionId === 'null' || inputRegionId === 'undefined' || !inputRegionId) ? null : inputRegionId;

  if (roleName === "SUPER_ADMIN" || roleName === "superadmin") {
    return normalizedInputId; // Super Admin can set any region (or null for global)
  }

  // For Regional Admin, lock to first assigned region if not provided or invalid
  if (assignedRegions && assignedRegions.length > 0) {
    if (normalizedInputId && assignedRegions.includes(normalizedInputId)) {
      return normalizedInputId;
    }
    return assignedRegions[0]; // Lock to the first assigned region
  }

  return null;
}

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

  // Helper to safely convert string IDs to ObjectIds for aggregation compatibility
  const toObjectId = (id) => {
    if (id && typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return id;
  };

  // Super Admin can see everything or filter by selected region
  // Super Admin can see everything or filter by selected region
  if (roleName === "SUPER_ADMIN" || roleName === "superadmin") {
    if (selectedRegionId) {
      return { regionId: toObjectId(selectedRegionId) };
    }
    return {}; // No region filter for Super Admin by default
  }

  // STAFF typically has broad access unless assigned to specific regions
  if (roleName === "STAFF" && (!assignedRegions || assignedRegions.length === 0)) {
    if (selectedRegionId) {
      return { regionId: selectedRegionId };
    }
    return {}; 
  }

  // Regional Admin is scoped to their assigned regions
  if (assignedRegions && assignedRegions.length > 0) {
    const objectIdAssignedRegions = assignedRegions.map(toObjectId);

    if (selectedRegionId && assignedRegions.includes(selectedRegionId)) {
      return { regionId: toObjectId(selectedRegionId) };
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

  if (roleName === "SUPER_ADMIN" || roleName === "superadmin") {
    return inputRegionId; // Super Admin can set any region
  }

  // For Regional Admin, lock to first assigned region if not provided or invalid
  if (assignedRegions && assignedRegions.length > 0) {
    if (inputRegionId && assignedRegions.includes(inputRegionId)) {
      return inputRegionId;
    }
    return assignedRegions[0]; // Lock to the first assigned region
  }

  return null;
}

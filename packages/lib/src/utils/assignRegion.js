
import RegionModel from "../models/admin/Region.model.js";

/**
 * Assigns a region based on Location (Lat/Lng) using strict geospatial matching.
 * 
 * Logic:
 * 1. Geospatial Match (Point inside Region Polygon)
 * 
 * @param {object} coordinates - { lat: number, lng: number }
 * @returns {Promise<string|null>} Region ObjectId or null
 */
export const assignRegion = async (city, state, coordinates) => {
  try {
    // 1. Geospatial Match (Highest Priority)
    if (coordinates && 
        typeof coordinates.lat === 'number' && 
        typeof coordinates.lng === 'number' && 
        coordinates.lat !== 0 && coordinates.lng !== 0) {
      
      const region = await RegionModel.findOne({
        geometry: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [coordinates.lng, coordinates.lat] // GeoJSON is [lng, lat]
            }
          }
        },
        isActive: true
      });
      
      if (region) {
        console.log(`[RegionAssignment] Geospatial match found: ${region.name} for [${coordinates.lat}, ${coordinates.lng}]`);
        return region._id;
      }
    }

    // No fallback, no default region as per requirements
    console.warn(`[RegionAssignment] No region found for coordinates:`, coordinates);
    return null;

  } catch (error) {
    console.error("Error assigning region:", error);
    return null;
  }
};

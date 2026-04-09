
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

    // 2. Text-based Match (Fallback for imprecise coordinates or neighborhoods like "Baner, Pune")
    if (city && typeof city === 'string' && city.trim() !== "" && city !== "Current Location") {
      const cityParts = city.split(',').map(part => part.trim().toLowerCase());
      const allRegions = await RegionModel.find({ isActive: true }).lean();
      
      for (const part of cityParts) {
        if (!part || part.length < 3) continue;

        // Find a region whose name or code overlaps with the search part
        const matchedRegion = allRegions.find(r => {
          const rName = r.name.toLowerCase();
          const rCode = r.code.toLowerCase();
          return part.includes(rName) || rName.includes(part) || 
                 part.includes(rCode) || rCode.includes(part);
        });

        if (matchedRegion) {
          console.log(`[RegionAssignment] Full-text match found: ${matchedRegion.name} for location part: ${part}`);
          return matchedRegion._id;
        }
      }
    }

    // No fallback, no default region as per requirements
    console.warn(`[RegionAssignment] No region found for city: ${city}, coordinates:`, coordinates);
    return null;

  } catch (error) {
    console.error("Error assigning region:", error);
    return null;
  }
};

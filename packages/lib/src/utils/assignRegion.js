
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
    const searchString = [city, state].filter(s => s && typeof s === 'string' && s.trim() !== "" && s !== "Current Location").join(', ');
    
    if (searchString) {
      const parts = searchString.split(',').map(part => part.trim().toLowerCase());
      const allRegions = await RegionModel.find({ isActive: true }).lean();
      
      console.log(`[RegionAssignment] Attempting text match for: "${searchString}" across ${allRegions.length} regions`);

      // Priority 1: Exact matches for name or code
      for (const part of parts) {
        if (!part || part.length < 3) continue;

        const exactMatch = allRegions.find(r => 
          r.name.toLowerCase() === part || 
          r.code.toLowerCase() === part
        );

        if (exactMatch) {
          console.log(`[RegionAssignment] Exact text match found: ${exactMatch.name} for part: "${part}"`);
          return exactMatch._id;
        }
      }

      // Priority 2: Overlap matches (the existing logic)
      for (const part of parts) {
        if (!part || part.length < 3) continue;

        const matchedRegion = allRegions.find(r => {
          const rName = r.name.toLowerCase();
          const rCode = r.code.toLowerCase();
          return part.includes(rName) || rName.includes(part) || 
                 part.includes(rCode) || rCode.includes(part);
        });

        if (matchedRegion) {
          console.log(`[RegionAssignment] Overlap text match found: ${matchedRegion.name} for part: "${part}"`);
          return matchedRegion._id;
        }
      }
    }

    // No fallback, no default region as per requirements
    console.warn(`[RegionAssignment] No region found for city: ${city}, state: ${state}, coordinates:`, coordinates);
    return null;

  } catch (error) {
    console.error("Error assigning region:", error);
    return null;
  }
};

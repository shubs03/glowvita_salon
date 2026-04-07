import { NextResponse } from "next/server";
import { assignRegion } from "@repo/lib/utils/assignRegion.js";
import connectDB from "@repo/lib/db";

export const dynamic = 'force-dynamic';

/**
 * GET /api/regions/detect?lat=...&lng=...
 * 
 * Detects the matching region ID for given coordinates using geospatial matching.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const city = searchParams.get("city") || "";

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, message: "Invalid coordinates provided" },
        { status: 400 }
      );
    }

    await connectDB();

    // Use established assignRegion utility
    // It returns the region._id or null
    const regionId = await assignRegion(city, null, { lat, lng });

    return NextResponse.json({
      success: true,
      regionId
    });

  } catch (error) {
    console.error("[RegionDetectAPI] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

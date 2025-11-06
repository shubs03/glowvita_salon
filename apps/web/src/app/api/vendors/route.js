import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor.model";

const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export const OPTIONS = async () => {
  return setCorsHeaders(new Response(null, { status: 200 }));
};

export const GET = async () => {
  try {
    const db = await _db();
    if (!db) {
      return setCorsHeaders(
        Response.json({ success: false, message: "Service unavailable", vendors: [] }, { status: 503 })
      );
    }

    // ✅ Clean and efficient query
    const vendors = await VendorModel.find(
      { status: "Approved" },
      {
        businessName: 1,
        firstName: 1,
        lastName: 1,
        city: 1,
        state: 1,
        category: 1,
        subCategories: 1,
        profileImage: 1,
        description: 1,
        createdAt: 1,
      }
    )
      .lean()
      .limit(10) // safe to increase
      .maxTimeMS(2000) // increased timeout
      .exec();

    return setCorsHeaders(
      Response.json({
        success: true,
        vendors,
        count: vendors.length,
      })
    );
  } catch (error) {
    console.error("Error fetching public vendors:", error);
    return setCorsHeaders(
      Response.json({ success: false, message: "Failed to fetch vendors", vendors: [] }, { status: 500 })
    );
  }
};
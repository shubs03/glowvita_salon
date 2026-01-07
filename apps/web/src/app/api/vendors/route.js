import _db from "@repo/lib/db";
import VendorModel from "@repo/lib/models/Vendor/Vendor.model";
import VendorServicesModel from "@repo/lib/models/Vendor/VendorServices.model";
import mongoose from "mongoose";
import CategoryModel from "@repo/lib/models/admin/Category.model";

const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export const OPTIONS = async () => {
  return setCorsHeaders(new Response(null, { status: 200 }));
};

export const GET = async (request) => {
  try {
    const db = await _db();
    if (!db) {
      return setCorsHeaders(
        Response.json({ success: false, message: "Service unavailable", vendors: [] }, { status: 503 })
      );
    }

    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get('serviceName')?.trim() || "";
    const city = searchParams.get('city');
    const categoryIdsStr = searchParams.get('categoryIds');
    const serviceIdsStr = searchParams.get('serviceIds');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const categoryIds = categoryIdsStr ? categoryIdsStr.split(',').filter(id => id.trim() !== '').map(id => new mongoose.Types.ObjectId(id)) : [];
    const serviceIds = serviceIdsStr ? serviceIdsStr.split(',').filter(id => id.trim() !== '').map(id => new mongoose.Types.ObjectId(id)) : [];

    // Base query for VendorServices
    let matchStage = { "services.status": "approved" };

    // Apply strict filtering if any filter is provided
    const hasFilter = serviceName !== "" || categoryIds.length > 0 || serviceIds.length > 0;
    
    // Aggregation Pipeline
    const pipeline = [];

    // Step 1: Filter VendorServices documents efficiently
    // If we have categoryIds or serviceIds, we can match at the top level first to prune documents
    if (categoryIds.length > 0 || serviceIds.length > 0 || serviceName) {
      const filterConditions = [];
      if (categoryIds.length > 0) filterConditions.push({ "services.category": { $in: categoryIds } });
      if (serviceIds.length > 0) filterConditions.push({ "services._id": { $in: serviceIds } });
      if (serviceName) filterConditions.push({ "services.name": { $regex: new RegExp(serviceName, 'i') } });
      
      pipeline.push({ $match: { $or: filterConditions } });
    }

    // Step 2: Join with Vendor data
    pipeline.push({
      $lookup: {
        from: "vendors",
        localField: "vendor",
        foreignField: "_id",
        as: "vendorData"
      }
    });

    pipeline.push({ $unwind: "$vendorData" });

    // Step 3: Filter by Vendor status and City
    let vendorMatch = { "vendorData.status": "Approved" };
    if (city && city !== 'Current Location') {
      vendorMatch["vendorData.city"] = { $regex: new RegExp(city, 'i') };
    }
    pipeline.push({ $match: vendorMatch });

    // Step 4: Unwind and filter specific services strictly
    pipeline.push({ $unwind: "$services" });
    
    let specificServiceMatch = { "services.status": "approved" };
    if (hasFilter) {
      const serviceConditions = [];
      if (categoryIds.length > 0) serviceConditions.push({ "services.category": { $in: categoryIds } });
      if (serviceIds.length > 0) serviceConditions.push({ "services._id": { $in: serviceIds } });
      if (serviceName) serviceConditions.push({ 
        $or: [
          { "services.name": { $regex: new RegExp(serviceName, 'i') } },
          { "vendorData.businessName": { $regex: new RegExp(serviceName, 'i') } }
        ]
      });
      
      if (serviceConditions.length > 0) {
        specificServiceMatch.$or = serviceConditions;
      }
    }
    pipeline.push({ $match: specificServiceMatch });

    // Step 5: Populate category details inside aggregation if possible, or just group
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "services.category",
        foreignField: "_id",
        as: "services.category"
      }
    });

    pipeline.push({
      $unwind: {
        path: "$services.category",
        preserveNullAndEmptyArrays: true
      }
    });

    // Step 6: Regroup by Vendor to reconstruct the structure
    pipeline.push({
      $group: {
        _id: "$vendorData._id",
        businessName: { $first: "$vendorData.businessName" },
        firstName: { $first: "$vendorData.firstName" },
        lastName: { $first: "$vendorData.lastName" },
        city: { $first: "$vendorData.city" },
        state: { $first: "$vendorData.state" },
        category: { $first: "$vendorData.category" },
        subCategories: { $first: "$vendorData.subCategories" },
        profileImage: { $first: "$vendorData.profileImage" },
        description: { $first: "$vendorData.description" },
        createdAt: { $first: "$vendorData.createdAt" },
        subscription: { $first: "$vendorData.subscription" },
        services: { $push: "$services" }
      }
    });

    // Step 7: Final sorting and pagination
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });

    const finalResults = await VendorServicesModel.aggregate(pipeline).exec();

    return setCorsHeaders(
      Response.json({
        success: true,
        vendors: finalResults,
        count: finalResults.length,
      })
    );
  } catch (error) {
    console.error("Search API Error:", error);
    return setCorsHeaders(
      Response.json({ success: false, message: "Internal server error", vendors: [] }, { status: 500 })
    );
  }
};

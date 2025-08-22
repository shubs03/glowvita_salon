import _db from "../../../../../../../packages/lib/src/db.js";
import VendorServicesModel from "../../../../../../../packages/lib/src/models/Vendor/VendorServices.model.js";
import CategoryModel from "../../../../../../../packages/lib/src/models/admin/Category.model.js";
import { authMiddlewareCrm } from "../../../../middlewareCrm.js";

await _db();

// POST: Create or update a VendorServices document, adding services to the array
export const POST = authMiddlewareCrm(async (req) => {

  const vendor  = req.user;
  const body = await req.json();
  const { services } = body;

  console.log("vendor", vendor);

  const vendorId  =  vendor._id.toString();

  // 1️⃣ Validate required fields
  if (!vendor || !services || !Array.isArray(services)) {
    return Response.json(
      { message: "Vendor ID and services array are required" },
      { status: 400 }
    );
  }

  // 2️⃣ Validate each service
  for (const service of services) {
    if (!service.name || !service.category || !service.price || !service.duration || !service.description || !service.gender) {
      return Response.json(
        { message: "Each service must have name, category, price, duration, description, and gender" },
        { status: 400 }
      );
    }
  }

  // 3️⃣ Create or update VendorServices document
  const vendorServices = await VendorServicesModel.findOneAndUpdate(
    { vendor },
    {
      $push: { services: { $each: services } },
      $set: { updatedAt: Date.now() },
    },
    { upsert: true, new: true }
  ).populate("services.category");

  return Response.json(
    { message: "Services added successfully", vendorServices },
    { status: 201 }
  );
}, ["crm_admin"]);

// GET: Retrieve VendorServices by vendor ID or paginated services
export const GET = authMiddlewareCrm(async (req) => {
  const url = new URL(req.url);
  const vendorId = req.user._id.toString();
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");

  console.log("vendorId get", vendorId);

  if (!vendorId) {
    return Response.json(
      { message: "Vendor ID is required" },
      { status: 400 }
    );
  }

  const vendorServices = await VendorServicesModel.getServicesByVendor(
    vendorId,
    page,
    limit,
    status,
    category
  );

  if (!vendorServices || vendorServices.length === 0) {
    return Response.json(
      { message: "No services found for this vendor" },
      { status: 404 }
    );
  }

  // ✅ Now each service has "categoryName" along with "category" ObjectId
  return Response.json(vendorServices[0]);
}, ["crm_admin"]);



// PUT: Update specific services in the VendorServices document
export const PUT = authMiddlewareCrm(async (req) => {
  const vendorId = req.user._id.toString();
  const body = await req.json();
  const {  services } = body;

  if (!vendorId || !services || !Array.isArray(services)) {
    return Response.json(
      { message: "Vendor ID and services array are required" },
      { status: 400 }
    );
  }

  // Update each service individually
  const updatePromises = services.map((service) =>
    VendorServicesModel.findOneAndUpdate(
      { vendor: vendorId, "services._id": service._id },
      {
        $set: {
          "services.$.name": service.name,
          "services.$.category": service.category,
          "services.$.price": service.price,
          "services.$.discountedPrice": service.discountedPrice,
          "services.$.duration": service.duration,
          "services.$.description": service.description,
          "services.$.image": service.image,
          "services.$.gender": service.gender,
          "services.$.staff": service.staff,
          "services.$.commission": service.commission,
          "services.$.homeService": service.homeService,
          "services.$.weddingService": service.weddingService,
          "services.$.bookingInterval": service.bookingInterval,
          "services.$.tax": service.tax,
          "services.$.onlineBooking": service.onlineBooking,
          "services.$.status": service.status,
          "services.$.updatedAt": Date.now(),
        },
      },
      { new: true }
    ).populate("services.category")
  );

  const updatedServices = await Promise.all(updatePromises);

  if (!updatedServices.some((update) => update)) {
    return Response.json(
      { message: "No services updated or found" },
      { status: 404 }
    );
  }

  return Response.json(
    { message: "Services updated successfully", vendorServices: updatedServices.find((update) => update) },
    { status: 200 }
  );
}, ["crm_admin"]);

// DELETE: Remove specific services or the entire VendorServices document
export const DELETE = authMiddlewareCrm(async (req) => {

  const vendor = req.user._id.toString();

  const body = await req.json();
  const { serviceId } = body;

  if (!vendor) {
    return Response.json(
      { message: "Vendor ID is required" },
      { status: 400 }
    );
  }

  if (!serviceId) {
    return Response.json(
      { message: "Service ID is required" },
      { status: 400 }
    );
  }

  // Delete the specific service from vendor's services array
  const result = await VendorServicesModel.findOneAndUpdate(
    { vendor },
    {
      $pull: { services: { _id: serviceId } },
      $set: { updatedAt: Date.now() },
    },
    { new: true }
  ).populate("services.category");

  if (!result) {
    return Response.json(
      { message: "Vendor or service not found" },
      { status: 404 }
    );
  }

  return Response.json(
    { message: "Service deleted successfully", vendorServices: result },
    { status: 200 }
  );
}, ["crm_admin"]);

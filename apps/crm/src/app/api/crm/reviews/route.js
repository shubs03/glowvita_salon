import { NextResponse } from "next/server";
import _db from "../../../../../../../packages/lib/src/db.js";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import VendorServicesModel from '@repo/lib/models/Vendor/VendorServices.model';
import { authMiddlewareCrm } from "../../../../middlewareCrm";

await _db();

// GET - Fetch all reviews for vendor's/supplier's products and services
export const GET = authMiddlewareCrm(async (request) => {
  try {
    const userId = request.user.userId;
    const userRole = request.user.role;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, approved, pending
    const entityType = searchParams.get('entityType') || 'all'; // all, product, service, salon, doctor

    // Build query
    let query = {};
    
    // Filter by approval status
    if (filter === 'approved') {
      query.isApproved = true;
    } else if (filter === 'pending') {
      query.isApproved = false;
    }

    // Filter by entity type
    if (entityType !== 'all') {
      query.entityType = entityType;
    }

    let reviews = [];

    // For doctors, only show reviews for their own profile
    if (userRole === 'doctor') {
      query.entityId = userId;
      query.entityType = 'doctor';
      reviews = await ReviewModel.find(query).sort({ createdAt: -1 });
      
      // Populate doctor details
      for (let review of reviews) {
        const doctor = await DoctorModel.findById(review.entityId).select('name specialties experience rating');
        review._doc.entityDetails = doctor;
      }
    } 
    // For vendors and suppliers, show reviews for their products
    else if (userRole === 'vendor' || userRole === 'staff' || userRole === 'supplier') {
      const ownerId = userId;
      
      if (entityType === 'all' || entityType === 'product') {
        // Get owner's product IDs (works for both vendors and suppliers)
        const ownerProducts = await ProductModel.find({ vendorId: ownerId }).select('_id');
        const productIds = ownerProducts.map(p => p._id);

        if (productIds.length > 0) {
          const productReviews = await ReviewModel.find({
            ...query,
            entityType: 'product',
            entityId: { $in: productIds }
          })
          .sort({ createdAt: -1 });

          // Populate product details
          for (let review of productReviews) {
            const product = await ProductModel.findById(review.entityId).select('productName productImages price category origin vendorId');
            review._doc.entityDetails = product;
          }

          reviews = [...reviews, ...productReviews];
        }
      }

      // Add service reviews for vendors
      if ((userRole === 'vendor' || userRole === 'staff') && (entityType === 'all' || entityType === 'service')) {
        // Get service IDs for this vendor
        const vendorServicesDoc = await VendorServicesModel.findOne({ vendor: ownerId });
        let serviceIds = [];
        
        if (vendorServicesDoc && vendorServicesDoc.services) {
          serviceIds = vendorServicesDoc.services.map(s => s._id);
        }

        if (serviceIds.length > 0) {
          const serviceReviews = await ReviewModel.find({
            ...query,
            entityType: 'service',
            entityId: { $in: serviceIds }
          })
          .sort({ createdAt: -1 });

          // Populate service details
          for (let review of serviceReviews) {
            // Find the service in the vendor services document
            let serviceDetails = null;
            if (vendorServicesDoc) {
              const service = vendorServicesDoc.services.id(review.entityId);
              if (service) {
                serviceDetails = {
                  serviceName: service.name,
                  price: service.price,
                  duration: service.duration,
                  // Add other relevant service details as needed
                };
              }
            }
            review._doc.entityDetails = serviceDetails;
          }

          reviews = [...reviews, ...serviceReviews];
        }
      }

      if (userRole === 'vendor' || userRole === 'staff') {
        // Vendor-specific reviews (salon and doctor)
        if (entityType === 'all' || entityType === 'salon') {
          // Get salon reviews for this vendor
          const salonReviews = await ReviewModel.find({
            ...query,
            entityType: 'salon',
            entityId: ownerId // The salon ID is the vendor ID
          })
          .sort({ createdAt: -1 });

          // Add salon details (use vendor info)
          for (let review of salonReviews) {
            const vendor = await VendorModel.findById(ownerId).select('businessName');
            review._doc.entityDetails = {
              _id: ownerId,
              salonName: vendor?.businessName || 'Your Salon',
            };
          }

          reviews = [...reviews, ...salonReviews];
        }

        if (entityType === 'all' || entityType === 'doctor') {
          // For doctor reviews, we need to find doctors that are associated with this vendor
          // Since there's no direct link in the schema, we'll fetch all doctor reviews for now
          // In a more complete implementation, there should be a vendor-doctor relationship
          const doctorReviews = await ReviewModel.find({
            ...query,
            entityType: 'doctor'
          })
          .sort({ createdAt: -1 });

          // Populate doctor details
          for (let review of doctorReviews) {
            const doctor = await DoctorModel.findById(review.entityId).select('name specialties experience rating clinicName');
            review._doc.entityDetails = doctor;
          }

          reviews = [...reviews, ...doctorReviews];
        }
      }
    }

    return NextResponse.json({
      success: true,
      reviews,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    }, { status: 500 });
  }
});
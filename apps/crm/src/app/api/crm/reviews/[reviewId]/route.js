import { NextResponse } from "next/server";
import _db from "../../../../../../../../packages/lib/src/db.js";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import VendorServicesModel from '@repo/lib/models/Vendor/VendorServices.model';
import { authMiddlewareCrm } from "../../../../../middlewareCrm";

await _db();

// PATCH - Approve/Reject a review
export const PATCH = authMiddlewareCrm(async (request, { params }) => {
  try {
    const ownerId = request.user.userId;
    const { reviewId } = params;
    const body = await request.json();
    const { isApproved } = body;

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: "isApproved must be a boolean value"
      }, { status: 400 });
    }

    // Get the review
    const review = await ReviewModel.findById(reviewId);

    if (!review) {
      return NextResponse.json({
        success: false,
        message: "Review not found"
      }, { status: 404 });
    }

    // Verify that the requesting user owns the entity being reviewed
    if (review.entityType === 'product') {
      // For product reviews, check if the product belongs to this vendor/supplier
      const product = await ProductModel.findById(review.entityId);
      if (!product || product.vendorId.toString() !== ownerId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to modify this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'doctor') {
      // For doctor reviews, check if the doctor belongs to this vendor
      // Since there's no direct link, we'll allow vendors to manage all doctor reviews for now
      // In a more complete implementation, there should be a vendor-doctor relationship
      const doctor = await DoctorModel.findById(review.entityId);
      if (!doctor) {
        return NextResponse.json({
          success: false,
          message: "Doctor not found"
        }, { status: 404 });
      }
    } else if (review.entityType === 'service') {
      // For service reviews, check if the service belongs to this vendor
      const vendorServices = await VendorServicesModel.findOne({
        vendor: ownerId,
        "services._id": review.entityId
      });
      
      if (!vendorServices) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to modify this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'salon') {
      // For salon reviews, the entityId should match the vendorId
      if (review.entityId.toString() !== ownerId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to modify this review"
        }, { status: 403 });
      }
    }

    // Update review
    review.isApproved = isApproved;
    review.approvedAt = isApproved ? new Date() : null;
    await review.save();

    return NextResponse.json({
      success: true,
      message: isApproved ? "Review approved successfully" : "Review rejected successfully",
      review,
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update review",
      error: error.message
    }, { status: 500 });
  }
});

// DELETE - Delete a review
export const DELETE = authMiddlewareCrm(async (request, { params }) => {
  try {
    const ownerId = request.user.userId;
    const { reviewId } = params;

    // Get the review
    const review = await ReviewModel.findById(reviewId);

    if (!review) {
      return NextResponse.json({
        success: false,
        message: "Review not found"
      }, { status: 404 });
    }

    // Verify that the requesting user owns the entity being reviewed
    if (review.entityType === 'product') {
      // For product reviews, check if the product belongs to this vendor/supplier
      const product = await ProductModel.findById(review.entityId);
      if (!product || product.vendorId.toString() !== ownerId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to delete this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'doctor') {
      // For doctor reviews, check if the doctor belongs to this vendor
      // Since there's no direct link, we'll allow vendors to manage all doctor reviews for now
      // In a more complete implementation, there should be a vendor-doctor relationship
      const doctor = await DoctorModel.findById(review.entityId);
      if (!doctor) {
        return NextResponse.json({
          success: false,
          message: "Doctor not found"
        }, { status: 404 });
      }
    } else if (review.entityType === 'service') {
      // For service reviews, check if the service belongs to this vendor
      const vendorServices = await VendorServicesModel.findOne({
        vendor: ownerId,
        "services._id": review.entityId
      });
      
      if (!vendorServices) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to delete this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'salon') {
      // For salon reviews, the entityId should match the vendorId
      if (review.entityId.toString() !== ownerId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to delete this review"
        }, { status: 403 });
      }
    }

    // Delete the review
    await ReviewModel.findByIdAndDelete(reviewId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete review",
      error: error.message
    }, { status: 500 });
  }
});
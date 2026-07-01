import { NextResponse } from "next/server";import mongoose from "mongoose";import _db from "../../../../../../../../packages/lib/src/db.js";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import VendorServicesModel from '@repo/lib/models/Vendor/VendorServices.model';
import { authMiddlewareCrm } from "../../../../../middlewareCrm";

await _db();

const getEffectiveOwnerId = (request) => {
  const candidateIds = [
    request?.user?.vendorId,
    request?.user?.userId,
    request?.user?.id,
  ].filter(Boolean);

  return candidateIds[0]?.toString?.() || null;
};

// PATCH - Approve/Reject a review
export const PATCH = authMiddlewareCrm(async (request, { params }) => {
  try {
    const ownerId = getEffectiveOwnerId(request);
    const { reviewId } = params;

    if (!mongoose.isValidObjectId(reviewId)) {
      return NextResponse.json({
        success: false,
        message: "Invalid reviewId"
      }, { status: 400 });
    }

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
      if (!mongoose.isValidObjectId(review.entityId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid review entity reference"
        }, { status: 400 });
      }

      const product = await ProductModel.findById(review.entityId);
      const isOwner = product && [product.vendorId?.toString(), product.vendor?.toString()].some((id) => id && id === ownerId);
      if (!isOwner) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to modify this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'doctor') {
      if (!mongoose.isValidObjectId(review.entityId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid review entity reference"
        }, { status: 400 });
      }

      const doctor = await DoctorModel.findById(review.entityId);
      if (!doctor) {
        return NextResponse.json({
          success: false,
          message: "Doctor not found"
        }, { status: 404 });
      }
    } else if (review.entityType === 'service') {
      if (!mongoose.isValidObjectId(review.entityId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid review entity reference"
        }, { status: 400 });
      }

      if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid owner identity"
        }, { status: 401 });
      }

      const vendorServices = await VendorServicesModel.findOne({
        vendor: new mongoose.Types.ObjectId(ownerId),
        "services._id": review.entityId
      });

      if (!vendorServices) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to modify this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'salon') {
      if (!mongoose.isValidObjectId(review.entityId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid review entity reference"
        }, { status: 400 });
      }

      const vendor = await VendorModel.findById(review.entityId);
      const isOwner = !!(vendor && [vendor._id?.toString(), ownerId].some((id) => id && id === ownerId));
      if (!isOwner) {
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
    const ownerId = getEffectiveOwnerId(request);
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
      if (!mongoose.isValidObjectId(review.entityId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid review entity reference"
        }, { status: 400 });
      }

      const product = await ProductModel.findById(review.entityId);
      const isOwner = product && [product.vendorId?.toString(), product.vendor?.toString()].some((id) => id && id === ownerId);
      if (!isOwner) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to delete this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'doctor') {
      if (!mongoose.isValidObjectId(review.entityId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid review entity reference"
        }, { status: 400 });
      }

      const doctor = await DoctorModel.findById(review.entityId);
      if (!doctor) {
        return NextResponse.json({
          success: false,
          message: "Doctor not found"
        }, { status: 404 });
      }
    } else if (review.entityType === 'service') {
      if (!mongoose.isValidObjectId(review.entityId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid review entity reference"
        }, { status: 400 });
      }

      if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid owner identity"
        }, { status: 401 });
      }

      const vendorServices = await VendorServicesModel.findOne({
        vendor: new mongoose.Types.ObjectId(ownerId),
        "services._id": review.entityId
      });

      if (!vendorServices) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to delete this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'salon') {
      if (!mongoose.isValidObjectId(review.entityId)) {
        return NextResponse.json({
          success: false,
          message: "Invalid review entity reference"
        }, { status: 400 });
      }

      const vendor = await VendorModel.findById(review.entityId);
      const isOwner = !!(vendor && [vendor._id?.toString(), ownerId].some((id) => id && id === ownerId));
      if (!isOwner) {
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
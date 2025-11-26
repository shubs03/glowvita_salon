import { NextResponse } from "next/server";
import _db from "../../../../../../../../packages/lib/src/db.js";
import ReviewModel from "@repo/lib/models/Review/Review.model";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import DoctorModel from '@repo/lib/models/Vendor/Docters.model';
import { authMiddlewareCrm } from "../../../../../middlewareCrm";

await _db();

// PATCH - Approve/Reject a review
export const PATCH = authMiddlewareCrm(async (request, { params }) => {
  try {
    const vendorId = request.user.userId;
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

    // Verify ownership based on entity type
    if (review.entityType === 'product') {
      const product = await ProductModel.findById(review.entityId);
      if (!product || product.vendorId.toString() !== vendorId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to modify this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'salon') {
      // For salon reviews, the entityId should match the vendorId
      if (review.entityId.toString() !== vendorId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to modify this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'doctor') {
      // For doctor reviews, the entityId should match the vendorId
      if (review.entityId.toString() !== vendorId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to modify this review"
        }, { status: 403 });
      }
    }
    // TODO: Add verification for service reviews

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
    const vendorId = request.user.userId;
    const { reviewId } = params;

    // Get the review
    const review = await ReviewModel.findById(reviewId);

    if (!review) {
      return NextResponse.json({
        success: false,
        message: "Review not found"
      }, { status: 404 });
    }

    // Verify ownership based on entity type
    if (review.entityType === 'product') {
      const product = await ProductModel.findById(review.entityId);
      if (!product || product.vendorId.toString() !== vendorId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to delete this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'salon') {
      // For salon reviews, the entityId should match the vendorId
      if (review.entityId.toString() !== vendorId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to delete this review"
        }, { status: 403 });
      }
    } else if (review.entityType === 'doctor') {
      // For doctor reviews, the entityId should match the vendorId
      if (review.entityId.toString() !== vendorId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized to delete this review"
        }, { status: 403 });
      }
    }
    // TODO: Add verification for service reviews

    // Delete the review
    await ReviewModel.findByIdAndDelete(reviewId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
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

import { NextResponse } from "next/server";
import _db from "../../../../../../../packages/lib/src/db.js";
import ProductQuestion from "@repo/lib/models/Vendor/ProductQuestion.model";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import { authMiddlewareCrm } from "../../../../middlewareCrm";

await _db();

// GET - Fetch all questions for vendor's products
export const GET = authMiddlewareCrm(async (request) => {
  try {
    const vendorId = request.user.userId;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, answered, unanswered

    // Build query
    let query = { vendorId };
    
    if (filter === 'answered') {
      query.isAnswered = true;
    } else if (filter === 'unanswered') {
      query.isAnswered = false;
    }

    // Get all questions for vendor's products
    const questions = await ProductQuestion.find(query)
      .populate({
        path: 'productId',
        select: 'productName productImages price category',
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      questions,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching product questions:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message
    }, { status: 500 });
  }
});

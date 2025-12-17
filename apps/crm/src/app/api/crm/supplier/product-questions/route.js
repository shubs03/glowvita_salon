import { NextResponse } from "next/server";
import _db from "../../../../../../../../packages/lib/src/db";
import ProductQuestion from "@repo/lib/models/Vendor/ProductQuestion.model";
import ProductModel from '@repo/lib/models/Vendor/Product.model';
import { authMiddlewareCrm } from "../../../../../middlewareCrm";

await _db();

// GET - Fetch all questions for supplier's products
export const GET = authMiddlewareCrm(async (request) => {
  try {
    const supplierId = request.user.userId;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, answered, unanswered

    // Build query for supplier products
    let query = { vendorId: supplierId };
    
    if (filter === 'answered') {
      query.isAnswered = true;
    } else if (filter === 'unanswered') {
      query.isAnswered = false;
    }

    // Get all questions for supplier's products
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
    console.error("Error fetching supplier product questions:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message
    }, { status: 500 });
  }
}, ['supplier']);

// PATCH - Answer a question and optionally publish it
export const PATCH = authMiddlewareCrm(async (request) => {
  try {
    const supplierId = request.user.userId;
    const body = await request.json();
    const { questionId, answer, isPublished } = body;

    if (!answer || answer.trim().length < 10) {
      return NextResponse.json({
        success: false,
        message: "Answer must be at least 10 characters long"
      }, { status: 400 });
    }

    // Find the question and verify it belongs to this supplier
    const question = await ProductQuestion.findOne({
      _id: questionId,
      vendorId: supplierId,
    });

    if (!question) {
      return NextResponse.json({
        success: false,
        message: "Question not found or you don't have permission to answer it"
      }, { status: 404 });
    }

    // Update the question with answer
    question.answer = answer.trim();
    question.isAnswered = true;
    question.answeredAt = new Date();
    question.isPublished = isPublished === true;

    await question.save();

    return NextResponse.json({
      success: true,
      message: "Answer submitted successfully",
      question,
    }, { status: 200 });

  } catch (error) {
    console.error("Error answering question:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to submit answer",
      error: error.message
    }, { status: 500 });
  }
}, ['supplier']);

// DELETE - Delete a question
export const DELETE = authMiddlewareCrm(async (request) => {
  try {
    const supplierId = request.user.userId;
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({
        success: false,
        message: "Question ID is required"
      }, { status: 400 });
    }

    // Find and delete the question if it belongs to this supplier
    const question = await ProductQuestion.findOneAndDelete({
      _id: questionId,
      vendorId: supplierId,
    });

    if (!question) {
      return NextResponse.json({
        success: false,
        message: "Question not found or you don't have permission to delete it"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete question",
      error: error.message
    }, { status: 500 });
  }
}, ['supplier']);
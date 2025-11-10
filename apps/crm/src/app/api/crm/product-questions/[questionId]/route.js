import { NextResponse } from "next/server";
import _db from "../../../../../../../../packages/lib/src/db.js";
import ProductQuestion from "@repo/lib/models/Vendor/ProductQuestion.model";
import { authMiddlewareCrm } from "../../../../../middlewareCrm";

await _db();

// PATCH - Answer a question and optionally publish it
export const PATCH = authMiddlewareCrm(async (request, { params }) => {
  try {
    const vendorId = request.user.userId;
    const { questionId } = params;
    const body = await request.json();
    const { answer, isPublished } = body;

    if (!answer || answer.trim().length < 10) {
      return NextResponse.json({
        success: false,
        message: "Answer must be at least 10 characters long"
      }, { status: 400 });
    }

    // Find the question and verify it belongs to this vendor
    const question = await ProductQuestion.findOne({
      _id: questionId,
      vendorId,
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
});

// DELETE - Delete a question
export const DELETE = authMiddlewareCrm(async (request, { params }) => {
  try {
    const vendorId = request.user.userId;
    const { questionId } = params;

    // Find and delete the question if it belongs to this vendor
    const question = await ProductQuestion.findOneAndDelete({
      _id: questionId,
      vendorId,
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
});

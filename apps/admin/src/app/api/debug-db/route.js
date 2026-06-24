import { NextResponse } from "next/server";
import _db from "@repo/lib/db";
import mongoose from 'mongoose';

const { default: SocialMediaTemplateModel, modelName } = await import("@repo/lib/models/Marketing/socialMediaTemplate.model");

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await _db();
    const TemplateModel = mongoose.models[modelName] || mongoose.model(modelName, SocialMediaTemplateModel.schema);
    const templates = await TemplateModel.find({}).lean();
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

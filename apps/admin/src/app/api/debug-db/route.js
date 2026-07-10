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
    
    let adminUsers = [];
    try {
      const AdminModel = mongoose.models['AdminUser'] || mongoose.model('AdminUser', new mongoose.Schema({}, { strict: false }));
      adminUsers = await AdminModel.find({}).select('emailAddress roleName firstName lastName').lean();
    } catch (e) {
      console.error(e);
    }

    return NextResponse.json({ success: true, templates, adminUsers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

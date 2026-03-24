import { NextResponse } from "next/server";
import { uploadFile } from "@repo/lib/utils/upload";
import { authMiddlewareAdmin } from "../../../../middlewareAdmin.js";

/**
 * POST /api/admin/upload
 * Generic file upload endpoint for admin app
 * Handles multipart/form-data
 */
export const POST = authMiddlewareAdmin(async (req) => {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'general';

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { success: false, message: "No file uploaded or invalid file format" }, 
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate filename with timestamp
        const timestamp = Date.now();
        const fileName = `${folder}-${timestamp}`;
        const mimeType = file.type;

        // Use the utility to save the file
        const url = await uploadFile(buffer, fileName, mimeType);

        if (!url) {
            return NextResponse.json(
                { success: false, message: "Failed to save file to storage" }, 
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            url: url
        });

    } catch (error) {
        console.error("[AdminUpload] POST error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}, ["admin", "SUPER_ADMIN", "REGIONAL_ADMIN", "STAFF"], "payout:edit");

import path from "path";
import fs from "fs";

// ─── Upload directories ───────────────────────────────────────────────────────
// Local dev:   files live in apps/admin/public/uploads/  (served by Next.js dev server)
// Production:  files live in /home/glowvita/uploads/     (shared Docker volume, served
//              via the admin app's /api/local-image route)
const isProduction = process.env.NODE_ENV === 'production' || process.platform === 'linux';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");
const VPS_UPLOAD_DIR   = "/home/glowvita/uploads";

const UPLOAD_DIR = isProduction ? VPS_UPLOAD_DIR : LOCAL_UPLOAD_DIR;

// ─── Public URL prefix ────────────────────────────────────────────────────────
// We store RELATIVE paths (/uploads/filename) instead of absolute localhost/domain
// URLs. This makes stored URLs environment-agnostic:
//   • Local dev:   CRM next.config.js rewrites /uploads/* → http://localhost:3002/uploads/*
//                  Admin Next.js dev server serves public/uploads/ at /uploads/
//   • Production:  CRM next.config.js rewrites /uploads/* → http://localhost:3002/uploads/*
//                  Admin container serves /api/local-image?url=… from the shared volume
// Both work without changing any DB records between environments.
const BASE_URL = "/uploads/";

console.log(`Upload configuration: DIR=${UPLOAD_DIR}, BASE_URL=${BASE_URL}, isProduction=${isProduction}`);

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Uploads a file buffer and returns its relative URL (/uploads/filename).
 * @param {Buffer} buffer - The file buffer
 * @param {string} fileName - Name for the uploaded file (without extension)
 * @param {string} mimeType - The file's MIME type
 * @returns {Promise<string|null>} - Relative URL of the uploaded file or null on failure
 */
export async function uploadFile(buffer, fileName, mimeType) {
    try {
        const extension = mimeType.split("/")[1] || 'jpg';
        const fullFileName = `${fileName}.${extension}`;
        const filePath = path.join(UPLOAD_DIR, fullFileName);

        fs.writeFileSync(filePath, buffer);
        console.log(`File saved: ${filePath}`);

        return `${BASE_URL}${fullFileName}`;
    } catch (error) {
        console.error("File upload error:", error);
        return null;
    }
}

/**
 * Uploads a base64-encoded file and returns its relative URL (/uploads/filename).
 * @param {string} base64String - Base64 encoded file data (data:<mime>;base64,<data>)
 * @param {string} fileName - Name for the uploaded file (without extension)
 * @returns {Promise<string|null>} - Relative URL of the uploaded file or null on failure
 */
export async function uploadBase64(base64String, fileName) {
    try {
        console.log(`uploadBase64 called for ${fileName}`);
        const match = base64String.match(/^data:(.*?);base64,(.*)$/);
        if (!match) {
            console.error("Invalid Base64 format for", fileName);
            return null;
        }

        const fileType  = match[1];
        const base64Data = match[2];
        const extension  = fileType.split("/")[1];
        const fullFileName = `${Date.now()}-${fileName}.${extension}`;
        const filePath   = path.join(UPLOAD_DIR, fullFileName);
        console.log(`Target file path: ${filePath}`);

        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
        console.log(`File saved successfully: ${filePath}`);

        const url = `${BASE_URL}${fullFileName}`;
        console.log(`Generated URL: ${url}`);
        return url;
    } catch (error) {
        console.error("File upload error in uploadBase64 for", fileName, ":", error);
        return null;
    }
}

/**
 * Deletes a file from the upload directory.
 * Accepts either a relative path (/uploads/filename) or any URL containing the filename.
 * @param {string} fileUrl - The URL or path of the file to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export async function deleteFile(fileUrl) {
    try {
        const fileName = fileUrl.split('/').pop();
        const filePath = path.join(UPLOAD_DIR, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File deleted: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error("File deletion error:", error);
        return false;
    }
}
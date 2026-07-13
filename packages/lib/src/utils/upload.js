import path from "path";
import fs from "fs";


// Define base URLs
const LOCAL_BASE_URL = "http://localhost:3001/uploads/";
const VPS_BASE_URL = "https://glowvitasalon.com/glowvita/uploads/";


const isProduction = process.env.NODE_ENV === 'production' || process.platform === 'linux';

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");
const VPS_UPLOAD_DIR   = "/home/glowvita/uploads";

const UPLOAD_DIR = isProduction ? VPS_UPLOAD_DIR : LOCAL_UPLOAD_DIR;

const BASE_URL = isProduction ? VPS_BASE_URL : LOCAL_BASE_URL;


// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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
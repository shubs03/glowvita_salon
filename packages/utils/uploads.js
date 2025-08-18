import path from "path";
import fs from "fs";

// Define upload directories - can be switched between local and VPS
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");
const VPS_UPLOAD_DIR = "/root/Paarsh-Infotech/uploads";

// Define base URLs
const LOCAL_BASE_URL = "/uploads/";
const VPS_BASE_URL = "https://paarshinfotech.com/Paarsh-Infotech/uploads/";

// Set current configuration
const UPLOAD_DIR = VPS_UPLOAD_DIR ; // Switch to VPS_UPLOAD_DIR for VPS storage
const BASE_URL = VPS_BASE_URL; // Switch to VPS_BASE_URL for VPS storage

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Uploads a file and returns its URL.
 * @param {Buffer} buffer - The file buffer
 * @param {string} fileName - Name for the uploaded file (without extension)
 * @param {string} mimeType - The file's MIME type
 * @returns {Promise<string|null>} - Public URL of the uploaded file or null on failure
 */
export async function uploadFile(buffer, fileName, mimeType) {
    try {
        // Get file extension from MIME type
        const extension = mimeType.split("/")[1] || 'jpg';
        
        // Generate a unique file name
        const fullFileName = `${Date.now()}-${fileName}.${extension}`;
        const filePath = path.join(UPLOAD_DIR, fullFileName);
        
        // Save the file
        fs.writeFileSync(filePath, buffer);
        
        console.log(`File saved: ${filePath}`);
        
        // Return the public URL of the uploaded file
        return `${BASE_URL}${fullFileName}`;
    } catch (error) {
        console.error("File upload error:", error);
        return null;
    }
}

/**
 * Uploads a base64 encoded file
 * @param {string} base64String - Base64 encoded file data
 * @param {string} fileName - Name for the uploaded file (without extension)
 * @returns {Promise<string|null>} - Public URL of the uploaded file or null on failure
 */
export async function uploadBase64(base64String, fileName) {
    try {
        // Validate Base64 format
        const match = base64String.match(/^data:(.*?);base64,(.*)$/);
        if (!match) {
            console.error("Invalid Base64 format.");
            return null;
        }
        
        const fileType = match[1]; // Example: video/mp4, image/png
        const base64Data = match[2];
        
        // Get file extension
        const extension = fileType.split("/")[1];
        
        // Generate a unique file name
        const fullFileName = `${Date.now()}-${fileName}.${extension}`;
        const filePath = path.join(UPLOAD_DIR, fullFileName);
        
        // Convert Base64 to buffer and save the file
        const buffer = Buffer.from(base64Data, "base64");
        fs.writeFileSync(filePath, buffer);
        
        console.log(`File saved: ${filePath}`);
        
        // Return the public URL of the uploaded file
        return `${BASE_URL}${fullFileName}`;
    } catch (error) {
        console.error("File upload error:", error);
        return null;
    }
}

/**
 * Deletes a file from the upload directory
 * @param {string} fileUrl - The URL of the file to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export async function deleteFile(fileUrl) {
    try {
        // Extract filename from URL
        const fileName = fileUrl.split('/').pop();
        const filePath = path.join(UPLOAD_DIR, fileName);
        
        // Check if file exists
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
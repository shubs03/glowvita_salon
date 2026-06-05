import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // Handle /uploads/ paths which are saved by the admin app in local dev
    if (fileUrl.includes('/uploads/')) {
      const filename = fileUrl.split('/uploads/').pop();
      if (!filename) return new NextResponse('Invalid filename', { status: 400 });

      // Resolve the path to the admin app's public/uploads folder
      // Assuming process.cwd() is apps/crm
      const adminUploadsDir = path.join(process.cwd(), '../admin/public/uploads');
      const crmUploadsDir = path.join(process.cwd(), 'public/uploads');
      
      let filePath = path.join(adminUploadsDir, filename);
      
      // If it doesn't exist in admin, try crm just in case
      if (!fs.existsSync(filePath)) {
        filePath = path.join(crmUploadsDir, filename);
      }

      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        let contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        else if (ext === '.gif') contentType = 'image/gif';

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*', // Crucial for FabricJS CORS
            'Cache-Control': 'public, max-age=31536000'
          }
        });
      }
    }

    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('Error serving local image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * GET /api/local-image?url=<encoded-url>
 *
 * Fallback image proxy used by TemplateCanvasThumbnail when the primary
 * /uploads/* rewrite fails (e.g. admin container is temporarily unreachable).
 *
 * Search order:
 *  1. Production Docker shared volume: /home/glowvita/uploads/
 *  2. Local dev – admin's public/uploads (relative from apps/crm → ../admin)
 *  3. Local dev – this app's own public/uploads
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    if (fileUrl.includes('/uploads/')) {
      let filename = fileUrl.split('/uploads/').pop();
      if (!filename) return new NextResponse('Invalid filename', { status: 400 });

      // Strip query parameters and hash to get the actual file name on disk
      filename = filename.split('?')[0].split('#')[0];

      const candidateDirs = [
        '/home/glowvita/uploads',                              // Production Docker shared volume
        path.join(process.cwd(), '../admin/public/uploads'),   // Local dev (cwd = apps/crm)
        path.join(process.cwd(), 'public/uploads'),            // This app's own public folder
      ];

      let filePath = '';
      for (const dir of candidateDirs) {
        const candidate = path.join(dir, filename);
        if (fs.existsSync(candidate)) {
          filePath = candidate;
          break;
        }
      }

      if (filePath) {
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
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    console.warn(`[CRM local-image] File not found for URL: ${fileUrl}`);
    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('[CRM local-image] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * GET /api/local-image?url=<encoded-url>
 *
 * Universal image-serving proxy for uploaded files.
 * Works both in local dev and in production Docker containers.
 *
 * Local dev:  files are in apps/admin/public/uploads/
 * Production: files are in /home/glowvita/uploads/ (shared Docker volume)
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

      // Search candidate directories in priority order:
      // 1. Production VPS shared volume
      // 2. Local dev — admin's public/uploads (relative from apps/admin)
      // 3. Local dev — absolute fallback
      const candidateDirs = [
        '/home/glowvita/uploads',                                    // Production Docker volume
        path.join(process.cwd(), 'public/uploads'),                  // Local dev (cwd = apps/admin)
        path.join(process.cwd(), '../admin/public/uploads'),         // Alternate local dev path
        path.join(process.cwd(), 'apps/admin/public/uploads'),       // Monorepo root fallback
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

    console.warn(`[local-image] File not found for URL: ${fileUrl}`);
    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('[local-image] Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

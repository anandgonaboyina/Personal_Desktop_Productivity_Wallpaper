import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Provide a safe filename
    const ext = path.extname(file.name);
    const basename = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${basename}-${Date.now()}${ext}`;

    const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    const filepath = path.join(thumbnailsDir, filename);
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ success: true, url: `/api/thumbnails?file=${filename}` });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return NextResponse.json({ error: 'Failed to upload thumbnail' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const fileParam = req.nextUrl.searchParams.get('file');
    if (!fileParam) {
      return new NextResponse('No file provided', { status: 400 });
    }

    const safeFilename = path.basename(fileParam);
    const filepath = path.join(process.cwd(), 'public', 'thumbnails', safeFilename);

    if (!fs.existsSync(filepath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    const buffer = fs.readFileSync(filepath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Length': buffer.length.toString(),
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

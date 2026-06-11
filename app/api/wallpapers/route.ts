import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const wallpapersDir = path.join(process.cwd(), 'public', 'wallpapers');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(wallpapersDir)) {
      fs.mkdirSync(wallpapersDir, { recursive: true });
      return NextResponse.json({ backgrounds: [] });
    }

    const files = fs.readdirSync(wallpapersDir);
    
    const backgrounds = files.map(file => {
      const ext = path.extname(file).toLowerCase();
      const isVideo = ['.mp4', '.webm', '.ogg'].includes(ext);
      const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      
      if (isVideo || isImage) {
        return {
          type: isVideo ? 'video' : 'image',
          src: `/wallpapers/${file}`,
          filename: file
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ backgrounds });
  } catch (error) {
    console.error('Error reading wallpapers directory:', error);
    return NextResponse.json({ error: 'Failed to read wallpapers' }, { status: 500 });
  }
}

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

    const wallpapersDir = path.join(process.cwd(), 'public', 'wallpapers');
    if (!fs.existsSync(wallpapersDir)) {
      fs.mkdirSync(wallpapersDir, { recursive: true });
    }

    const filepath = path.join(wallpapersDir, filename);
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error('Error uploading wallpaper:', error);
    return NextResponse.json({ error: 'Failed to upload wallpaper' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { filename } = await req.json();
    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Security check: prevent directory traversal
    const safeFilename = path.basename(filename);
    const filepath = path.join(process.cwd(), 'public', 'wallpapers', safeFilename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting wallpaper:', error);
    return NextResponse.json({ error: 'Failed to delete wallpaper' }, { status: 500 });
  }
}

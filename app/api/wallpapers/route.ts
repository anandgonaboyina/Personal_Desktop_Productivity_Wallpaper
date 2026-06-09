import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const wallpapersDir = path.join(process.cwd(), 'public', 'wallpapers');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(wallpapersDir)) {
      fs.mkdirSync(wallpapersDir, { recursive: true });
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(wallpapersDir);
    
    const backgrounds = files.map(file => {
      const ext = path.extname(file).toLowerCase();
      const isVideo = ['.mp4', '.webm', '.ogg'].includes(ext);
      const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      
      if (isVideo || isImage) {
        return {
          type: isVideo ? 'video' : 'image',
          src: `/wallpapers/${file}`
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

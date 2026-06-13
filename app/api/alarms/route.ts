import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const customAlarmsDir = path.join(process.cwd(), 'public', 'custom-alarms');
    
    if (!fs.existsSync(customAlarmsDir)) {
      fs.mkdirSync(customAlarmsDir, { recursive: true });
    }

    const files = fs.readdirSync(customAlarmsDir);
    const audioFiles = files.filter(f => /\.(mp3|wav|ogg)$/i.test(f));

    return NextResponse.json(audioFiles);
  } catch (error) {
    console.error('Error fetching alarms:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const customAlarmsDir = path.join(process.cwd(), 'public', 'custom-alarms');
    if (!fs.existsSync(customAlarmsDir)) {
      fs.mkdirSync(customAlarmsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filepath = path.join(customAlarmsDir, safeName);
    
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({ success: true, filename: safeName });
  } catch (error) {
    console.error('Error uploading alarm:', error);
    return NextResponse.json({ error: 'Failed to upload alarm' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { filename } = await req.json();
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const safeName = path.basename(filename);
    const filepath = path.join(process.cwd(), 'public', 'custom-alarms', safeName);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alarm:', error);
    return NextResponse.json({ error: 'Failed to delete alarm' }, { status: 500 });
  }
}

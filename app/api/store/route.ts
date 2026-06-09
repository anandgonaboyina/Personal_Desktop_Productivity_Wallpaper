import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const record = await prisma.dashboardStorage.findUnique({
      where: { id: 1 },
    });
    
    if (!record) {
      return NextResponse.json({ data: null });
    }
    
    return NextResponse.json({ data: record.data });
  } catch (error) {
    console.error('Error reading store from DB:', error);
    return NextResponse.json({ error: 'Failed to read store' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await prisma.dashboardStorage.upsert({
      where: { id: 1 },
      update: {
        data: body.data || {},
      },
      create: {
        id: 1,
        data: body.data || {},
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing store to DB:', error);
    return NextResponse.json({ error: 'Failed to write store' }, { status: 500 });
  }
}

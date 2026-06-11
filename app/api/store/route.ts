import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = parseInt(searchParams.get('profileId') || '1');

    const record = await prisma.dashboardStorage.findUnique({
      where: { id: profileId },
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
    const profileId = body.profileId ? parseInt(body.profileId) : 1;
    
    await prisma.dashboardStorage.upsert({
      where: { id: profileId },
      update: {
        data: body.data || {},
      },
      create: {
        id: profileId,
        data: body.data || {},
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing store to DB:', error);
    return NextResponse.json({ error: 'Failed to write store' }, { status: 500 });
  }
}

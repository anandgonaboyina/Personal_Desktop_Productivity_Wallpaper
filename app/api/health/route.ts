import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = parseInt(searchParams.get('profileId') || '1');

    const records = await prisma.healthRecord.findMany({
      where: { profileId },
      orderBy: { date: 'asc' }
    });

    // Format into a Map of { 'YYYY-MM-DD': { water, stretch, reading, academic, english } }
    const healthData: Record<string, any> = {};
    records.forEach(r => {
      healthData[r.date] = {
        water: r.water,
        stretch: r.stretch,
        reading: r.reading,
        academic: r.academic,
        english: r.english,
      };
    });

    return NextResponse.json({ data: healthData });
  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json({ error: 'Failed to fetch health data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dateKey, metric, incrementValue } = body;
    const profileId = body.profileId ? parseInt(body.profileId) : 1;

    if (!dateKey || !metric || incrementValue === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Upsert the record for the specific date and profile
    const updatedRecord = await prisma.healthRecord.upsert({
      where: {
        profileId_date: {
          profileId,
          date: dateKey
        }
      },
      update: {
        [metric]: { increment: incrementValue },
      },
      create: {
        profileId,
        date: dateKey,
        water: 0,
        stretch: 0,
        reading: 0,
        academic: 0,
        english: 0,
        [metric]: incrementValue,
      },
    });

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error('Error updating health data:', error);
    return NextResponse.json({ error: 'Failed to update health data' }, { status: 500 });
  }
}

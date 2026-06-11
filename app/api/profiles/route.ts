import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { id: 'asc' },
    });

    // If no profiles exist, create a default one
    if (profiles.length === 0) {
      const defaultProfile = await prisma.profile.create({
        data: { name: 'Default User' }
      });
      return NextResponse.json({ profiles: [defaultProfile] });
    }

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { name }
    });

    if (existingProfile) {
      return NextResponse.json({ error: 'Profile name already exists' }, { status: 400 });
    }

    const newProfile = await prisma.profile.create({
      data: { name }
    });

    return NextResponse.json({ success: true, profile: newProfile });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id || id === 1) {
      return NextResponse.json({ error: 'Cannot delete the default profile or invalid ID' }, { status: 400 });
    }

    // 1. Delete associated DashboardStorage
    try {
      await prisma.dashboardStorage.delete({ where: { id } });
    } catch (e) {
      // Ignore if it doesn't exist
    }

    // 2. Delete associated HealthRecords
    await prisma.healthRecord.deleteMany({ where: { profileId: id } });

    // 3. Delete Profile
    await prisma.profile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}

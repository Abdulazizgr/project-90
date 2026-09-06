import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCleanUserData } from '@/utils/seedData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest_user';
    const name = searchParams.get('name') || '';

    const db = await getDatabase('project90');
    const collection = db.collection('user_data');

    let userData: any = await collection.findOne({ userId });

    if (!userData) {
      // Initialize 100% clean Day 1 state from scratch
      const initial = getCleanUserData({ name: name || (userId.includes('@') ? userId.split('@')[0] : 'User'), email: userId });

      userData = {
        userId,
        ...initial,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await collection.insertOne(userData);
    }

    return NextResponse.json({ success: true, data: userData });
  } catch (error: any) {
    console.error('Error in GET /api/data:', error);
    // Fallback gracefully to clean state
    return NextResponse.json({ success: true, data: getCleanUserData(), error: error?.message || 'Database offline fallback' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId = 'guest_user', data } = body;

    if (!data) {
      return NextResponse.json({ success: false, message: 'Missing data payload' }, { status: 400 });
    }

    const db = await getDatabase('project90');
    const collection = db.collection('user_data');

    const { _id, ...cleanData } = data;

    await collection.updateOne(
      { userId },
      {
        $set: {
          ...cleanData,
          userId,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Data saved successfully to MongoDB' });
  } catch (error: any) {
    console.error('Error in POST /api/data:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save data' }, { status: 500 });
  }
}

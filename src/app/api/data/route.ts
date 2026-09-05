import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getDemoData, getCleanUserData } from '@/utils/seedData';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest_demo';
    const name = searchParams.get('name') || '';

    const db = await getDatabase('project90');
    const collection = db.collection('user_data');

    let userData = await collection.findOne({ userId });

    if (!userData) {
      // Demo user gets Day 12 sprint data; New users get 100% clean Day 1 state!
      const isDemoUser = userId === 'abdulaziz@project90.com' || userId === 'guest_demo';
      const initial = isDemoUser 
        ? getDemoData() 
        : getCleanUserData({ name: name || userId.split('@')[0], email: userId });

      userData = {
        userId,
        ...initial,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await collection.insertOne(userData);
    }

    return NextResponse.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error in GET /api/data:', error);
    // Fallback gracefully
    return NextResponse.json({ success: false, data: getDemoData(), error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 'guest_demo', data } = body;

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
  } catch (error) {
    console.error('Error in POST /api/data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

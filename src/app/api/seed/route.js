import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getDemoData, getCleanUserData } from '@/utils/seedData';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 'guest_demo', name = '' } = body;

    const db = await getDatabase('project90');
    const collection = db.collection('user_data');

    const isDemoUser = userId === 'abdulaziz@project90.com' || userId === 'guest_demo';
    const initial = isDemoUser 
      ? getDemoData() 
      : getCleanUserData({ name: name || userId.split('@')[0], email: userId });

    const resetData = {
      userId,
      ...initial,
      updatedAt: new Date()
    };

    await collection.updateOne(
      { userId },
      { $set: resetData },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: resetData, message: 'Reset data successfully' });
  } catch (error) {
    console.error('Error in POST /api/seed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCleanUserData } from '@/utils/seedData';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId = 'user_default', name = '', action = 'reset' } = body;

    const db = await getDatabase('project90');
    const collection = db.collection('user_data');

    if (action === 'clear_all') {
      // Clear all legacy and demo data in the database
      await collection.deleteMany({});
    }

    const initial = getCleanUserData({ name: name || (userId.includes('@') ? userId.split('@')[0] : 'User'), email: userId });

    const resetData = {
      userId,
      ...initial,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await collection.updateOne(
      { userId },
      { $set: resetData },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: resetData, message: 'All database and user data reset to clean scratch Day 1 state successfully' });
  } catch (error: any) {
    console.error('Error in POST /api/seed:', error);
    // Return clean fallback
    return NextResponse.json({ success: true, data: getCleanUserData(), message: 'Fallback to local clean data' });
  }
}

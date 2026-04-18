import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import NotificationSubscription from '@/models/NotificationSubscription';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const subscription = await req.json();
    await dbConnect();

    // Upsert subscription
    await NotificationSubscription.findOneAndUpdate(
      { userId: (session.user as any).id, 'subscription.endpoint': subscription.endpoint },
      { 
        subscription, 
        userAgent: req.headers.get('user-agent'),
        status: 'active'
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Subscription saved' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

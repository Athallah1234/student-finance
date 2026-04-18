import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SavingsGoal from '@/models/SavingsGoal';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const goals = await SavingsGoal.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json(goals);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const goal = await SavingsGoal.create({
      ...body,
      userId: (session.user as any).id,
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
      const body = await req.json();
      const { id, amount } = body;
  
      await dbConnect();
      const goal = await SavingsGoal.findOneAndUpdate(
        { _id: id, userId: (session.user as any).id },
        { $inc: { currentAmount: amount } },
        { new: true }
      );
  
      return NextResponse.json(goal);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

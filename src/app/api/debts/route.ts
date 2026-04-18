import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Debt from '@/models/Debt';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const debts = await Debt.find({ userId: (session.user as any).id }).sort({ deadline: 1 });

    return NextResponse.json(debts);
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

    const debt = await Debt.create({
      ...body,
      userId: (session.user as any).id,
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
      const body = await req.json();
      const { id, status } = body;
  
      await dbConnect();
      const debt = await Debt.findOneAndUpdate(
        { _id: id, userId: (session.user as any).id },
        { status },
        { new: true }
      );
  
      return NextResponse.json(debt);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget';
import Expense from '@/models/Expense';
import { logSecurityEvent } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const userId = (session.user as any).id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ userId, month, year });
    
    // Calculate spent for each budget category
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const spentData = await Expense.aggregate([
      { 
        $match: { 
          userId: new (require('mongoose').Types.ObjectId)(userId), 
          date: { $gte: startOfMonth, $lte: endOfMonth } 
        } 
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const budgetWithSpent = budgets.map(b => {
      const spent = spentData.find(s => s._id === b.category)?.total || 0;
      return {
        ...b.toObject(),
        spent
      };
    });

    return NextResponse.json(budgetWithSpent);
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

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { userId: (session.user as any).id, category: body.category, month, year },
      { amount: body.amount },
      { upsert: true, new: true }
    );

    return NextResponse.json(budget);
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

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: (session.user as any).id },
      { amount },
      { new: true }
    );

    return NextResponse.json(budget);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    await dbConnect();
    const budget = await Budget.findOne({ _id: id, userId: (session.user as any).id });
    if (budget) {
      await Budget.deleteOne({ _id: id });
      await logSecurityEvent((session.user as any).id, 'DELETE_BUDGET', `Category: ${budget.category}`, req);
    }

    return NextResponse.json({ message: 'Budget deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

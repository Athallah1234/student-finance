import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Income from '@/models/Income';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await dbConnect();
    const userId = (session.user as any).id;

    let query: any = { userId };
    if (search) query.source = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Income.countDocuments(query);
    const incomes = await Income.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Basic Stats
    const allIncomes = await Income.find({ userId });
    const totalAmount = allIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyAmount = allIncomes
      .filter(inc => new Date(inc.date) >= firstDayOfMonth)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      data: incomes,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats: {
        totalAmount,
        monthlyAmount,
        count: total
      }
    });
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
    const userId = (session.user as any).id;

    if (Array.isArray(body)) {
      const incomes = await Income.insertMany(
        body.map(item => ({ ...item, userId }))
      );
      return NextResponse.json(incomes, { status: 201 });
    }

    const income = await Income.create({
      ...body,
      userId,
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, ...updateData } = body;
    await dbConnect();
    const userId = (session.user as any).id;

    const income = await Income.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!income) return NextResponse.json({ message: 'Income not found' }, { status: 404 });

    return NextResponse.json(income);
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
      const ids = searchParams.get('ids');
      const userId = (session.user as any).id;
  
      await dbConnect();
      
      if (ids) {
        const idArray = ids.split(',');
        await Income.deleteMany({ _id: { $in: idArray }, userId });
        return NextResponse.json({ message: 'Bulk deleted' });
      }

      await Income.findOneAndDelete({ _id: id, userId });
  
      return NextResponse.json({ message: 'Deleted' });
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

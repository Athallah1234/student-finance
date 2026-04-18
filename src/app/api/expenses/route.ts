import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
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
    if (category && category !== 'All') query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      data: expenses,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
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
      const expenses = await Expense.insertMany(
        body.map(item => ({ ...item, userId }))
      );
      return NextResponse.json(expenses, { status: 201 });
    }

    const expense = await Expense.create({
      ...body,
      userId,
    });

    return NextResponse.json(expense, { status: 201 });
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

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!expense) return NextResponse.json({ message: 'Expense not found' }, { status: 404 });

    return NextResponse.json(expense);
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
        await Expense.deleteMany({ _id: { $in: idArray }, userId });
        return NextResponse.json({ message: 'Bulk deleted' });
      }

      await Expense.findOneAndDelete({ _id: id, userId });
  
      return NextResponse.json({ message: 'Deleted' });
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

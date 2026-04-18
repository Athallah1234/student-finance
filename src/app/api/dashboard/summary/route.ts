import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Income from '@/models/Income';
import Expense from '@/models/Expense';
import SavingsGoal from '@/models/SavingsGoal';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week') || 'this';

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const userId = new mongoose.Types.ObjectId((session.user as any).id);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Total Incomes
    const incomes = await Income.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly Incomes
    const monthlyIncomes = await Income.aggregate([
      { $match: { userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Total Expenses
    const expenses = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly Expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Savings
    const savings = await SavingsGoal.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$currentAmount' } } }
    ]);

    // Weekly Trend Data Logic
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    let sevenDaysAgo = new Date(startOfToday);
    let endOfPeriod = new Date(startOfToday);
    endOfPeriod.setUTCDate(endOfPeriod.getUTCDate() + 1); // Up to start of tomorrow

    if (weekParam === 'last') {
      sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 13);
      endOfPeriod.setUTCDate(endOfPeriod.getUTCDate() - 7);
    } else {
      sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    }

    const weeklyExpenses = await Expense.aggregate([
      { $match: { userId, date: { $gte: sevenDaysAgo, $lt: endOfPeriod } } },
      { 
        $group: { 
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$date" } 
          }, 
          total: { $sum: "$amount" } 
        } 
      },
      { $sort: { "_id": 1 } }
    ]);

    const weeklyIncomes = await Income.aggregate([
      { $match: { userId, date: { $gte: sevenDaysAgo, $lt: endOfPeriod } } },
      { 
        $group: { 
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$date" } 
          }, 
          total: { $sum: "$amount" } 
        } 
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format trend data for frontend
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const trendData = [];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setUTCDate(d.getUTCDate() + i);
      
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getUTCDay()];
      
      trendData.push({
        name: dayName,
        income: weeklyIncomes.find(w => w._id === dateStr)?.total || 0,
        expense: weeklyExpenses.find(w => w._id === dateStr)?.total || 0
      });
    }

    const totalIncome = incomes[0]?.total || 0;
    const totalExpense = expenses[0]?.total || 0;
    const currentBalance = totalIncome - totalExpense;

    // Recent Transactions
    const recentExpenses = await Expense.find({ userId }).sort({ date: -1 }).limit(5);

    return NextResponse.json({
      balance: currentBalance,
      monthlyIncome: monthlyIncomes[0]?.total || 0,
      monthlyExpense: monthlyExpenses[0]?.total || 0,
      totalSavings: savings[0]?.total || 0,
      recentExpenses,
      trendData
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

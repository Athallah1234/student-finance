'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowRight,
  Plus,
  Calendar,
  CreditCard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card rounded-3xl border"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-outfit">Ringkasan Keuangan</h2>
          <p className="text-muted-foreground">Berikut adalah kondisi keuanganmu saat ini.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/expenses" className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all">
            <Plus size={18} /> Tambah Pengeluaran
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Saldo" 
          value={formatCurrency(summary?.balance || 0)} 
          icon={<Wallet className="text-blue-500" />}
          trend="+0%"
          color="blue"
        />
        <StatCard 
          title="Pemasukan Bulan Ini" 
          value={formatCurrency(summary?.monthlyIncome || 0)} 
          icon={<TrendingUp className="text-emerald-500" />}
          trend="+0%"
          color="emerald"
        />
        <StatCard 
          title="Pengeluaran Bulan Ini" 
          value={formatCurrency(summary?.monthlyExpense || 0)} 
          icon={<TrendingDown className="text-rose-500" />}
          trend="-0%"
          color="rose"
        />
        <StatCard 
          title="Total Tabungan" 
          value={formatCurrency(summary?.totalSavings || 0)} 
          icon={<PiggyBank className="text-amber-500" />}
          trend="+0%"
          color="amber"
        />
      </div>

      {/* Comparison Chart */}
      <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="font-bold font-outfit text-xl">Pemasukan vs Pengeluaran</h3>
            <p className="text-sm text-muted-foreground">Perbandingan aliran kas dalam 7 hari terakhir.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium">Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-xs font-medium">Pengeluaran</span>
            </div>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary?.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888', fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888' }}
                tickFormatter={(val) => `Rp${val/1000}k`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '16px', 
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                formatter={(value: any) => [formatCurrency(value), '']}
              />
              <Bar 
                dataKey="income" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
                animationDuration={1500}
              />
              <Bar 
                dataKey="expense" 
                fill="#f43f5e" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold font-outfit text-xl">Transaksi Terbaru</h3>
          <Link href="/dashboard/expenses" className="text-sm text-primary font-bold hover:underline">Lihat Semua Riwayat</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary?.recentExpenses?.length > 0 ? (
            summary.recentExpenses.map((ex: any) => (
              <div key={ex._id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                     <CreditCard size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{ex.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ex.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-rose-500">-{formatCurrency(ex.amount)}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{ex.category}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colors: any = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
    rose: "from-rose-500/10 to-rose-600/5 border-rose-500/20",
    amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn("p-6 rounded-3xl border bg-linear-to-br shadow-sm", colors[color])}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-background rounded-2xl shadow-sm">
          {icon}
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full bg-background border", 
          trend.startsWith('+') ? "text-emerald-500" : "text-rose-500"
        )}>
          {trend}
        </span>
      </div>
      <p className="text-xs text-muted-foreground font-medium mb-1">{title}</p>
      <h4 className="text-xl font-bold font-outfit">{value}</h4>
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

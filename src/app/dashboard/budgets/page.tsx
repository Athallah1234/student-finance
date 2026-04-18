'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  PieChart, 
  Trash2, 
  AlertTriangle,
  X,
  CheckCircle2,
  MoreVertical,
  Zap,
  Target,
  TrendingDown,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  'Makan', 'Minum', 'Kos', 'Transportasi', 'Kuliah', 'Buku', 'Nongkrong', 'Hiburan', 'Belanja', 'Lainnya'
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  // Form states
  const [category, setCategory] = useState('Makan');
  const [amount, setAmount] = useState('');

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/budgets');
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/budgets';
      const method = isEditing ? 'PATCH' : 'POST';
      const body = isEditing 
        ? { id: selectedBudget._id, amount: Number(amount) }
        : { category, amount: Number(amount) };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isEditing ? 'Budget diperbarui!' : 'Budget disetel!');
        setIsModalOpen(false);
        setIsEditing(false);
        setSelectedBudget(null);
        setAmount('');
        fetchBudgets();
      }
    } catch (err) {
      toast.error('Gagal menyimpan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus budget ini?')) return;
    try {
      const res = await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Budget dihapus');
        fetchBudgets();
      }
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  const openEditModal = (budget: any) => {
    setSelectedBudget(budget);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Analysis Logic
  const analysis = (() => {
    if (budgets.length === 0) return null;

    const totalBudget = budgets.reduce((acc, curr: any) => acc + curr.amount, 0);
    const totalSpent = budgets.reduce((acc, curr: any) => acc + curr.spent, 0);
    
    // Most expensive by amount
    const mostExpensive = [...budgets].sort((a: any, b: any) => b.spent - a.spent)[0];
    
    // Most wasteful by percentage
    const mostWasteful = [...budgets].sort((a: any, b: any) => {
      const pA = (a.spent / a.amount);
      const pB = (b.spent / b.amount);
      return pB - pA;
    })[0];

    const overBudgetCategories = budgets.filter((b: any) => b.spent > b.amount).length;

    return {
      totalBudget,
      totalSpent,
      mostExpensive,
      mostWasteful,
      overBudgetCategories,
      overallProgress: (totalSpent / totalBudget) * 100
    };
  })();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-foreground">Analisis Budget</h2>
          <p className="text-muted-foreground">Analisis mendalam tentang kebiasaan pengeluaranmu.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={20} /> Setel Budget
        </button>
      </div>

      {/* Analysis Section */}
      {!isLoading && analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-3xl p-6 relative overflow-hidden group shadow-sm"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-all">
              <TrendingUp size={80} className="text-rose-500" />
            </div>
            <div className="flex items-center gap-2 mb-4">
               <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                  <Zap size={18} />
               </div>
               <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Kategori Terboros</span>
            </div>
            <h3 className="text-2xl font-bold font-outfit">{analysis.mostExpensive.category}</h3>
            <p className="text-sm text-rose-500 font-medium mt-1">
              Sudah menghabiskan {formatCurrency(analysis.mostExpensive.spent)}
            </p>
            <div className="mt-4 pt-4 border-t border-dashed">
               <p className="text-xs text-muted-foreground italic">"Pengeluaran terbesar bulan ini berasal dari kategori ini."</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-3xl p-6 relative overflow-hidden group shadow-sm"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-all">
              <AlertTriangle size={80} className="text-amber-500" />
            </div>
            <div className="flex items-center gap-2 mb-4">
               <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <TrendingUp size={18} />
               </div>
               <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Kritis / Overbudget</span>
            </div>
            <h3 className="text-2xl font-bold font-outfit">
              {analysis.mostWasteful.spent > analysis.mostWasteful.amount 
                ? analysis.mostWasteful.category 
                : "Belum Ada"}
            </h3>
            <p className="text-sm text-amber-500 font-medium mt-1">
              {analysis.mostWasteful.spent > analysis.mostWasteful.amount 
                ? `Melebihi ${(analysis.mostWasteful.spent / analysis.mostWasteful.amount * 100 - 100).toFixed(0)}% dari budget`
                : "Semua masih terkontrol"}
            </p>
            <div className="mt-4 pt-4 border-t border-dashed">
               <p className="text-xs text-muted-foreground italic">"Kategori ini memiliki rasio penggunaan budget paling tinggi."</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-3xl p-6 relative overflow-hidden group shadow-sm"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-all">
              <Target size={80} className="text-emerald-500" />
            </div>
            <div className="flex items-center gap-2 mb-4">
               <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <TrendingDown size={18} />
               </div>
               <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Kesehatan Keuangan</span>
            </div>
            <h3 className="text-2xl font-bold font-outfit">{analysis.overallProgress.toFixed(0)}% Digunakan</h3>
            <p className="text-sm text-emerald-500 font-medium mt-1">
              Sisa Total: {formatCurrency(analysis.totalBudget - analysis.totalSpent)}
            </p>
            <div className="mt-4 pt-4 border-t border-dashed">
               <p className="text-xs text-muted-foreground italic">"Rangkuman penggunaan budget dari seluruh kategori."</p>
            </div>
          </motion.div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold font-outfit mb-6 flex items-center gap-2">
           <CreditCard className="text-primary" size={24} />
           Rincian Per Kategori
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [1, 2].map((i) => (
            <div key={i} className="h-48 bg-card border rounded-3xl animate-pulse"></div>
          ))
        ) : budgets.length > 0 ? (
          budgets.map((b: any) => {
            const progress = (b.spent / b.amount) * 100;
            const displayProgress = Math.min(progress, 100);
            
            // Status Logic
            const isOverBudget = progress > 100;
            const isNearLimit = progress >= 80 && progress <= 100;
            const isSafe = progress < 80;

            let statusLabel = "Aman";
            let statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            let progressColor = "bg-emerald-500";
            let cardStyle = "border-border";
            let icon = <CheckCircle2 size={18} />;

            if (isOverBudget) {
              statusLabel = "Melebihi Budget";
              statusColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
              progressColor = "bg-rose-500";
              cardStyle = "border-rose-500/30 bg-rose-500/5";
              icon = <AlertTriangle size={18} />;
            } else if (isNearLimit) {
              statusLabel = "Mendekati Batas";
              statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
              progressColor = "bg-amber-500";
              cardStyle = "border-amber-500/30 bg-amber-500/5";
              icon = <AlertTriangle size={18} />;
            }

            return (
              <motion.div 
                key={b._id}
                whileHover={{ y: -5 }}
                className={cn(
                  "bg-card border rounded-3xl p-6 shadow-sm transition-all duration-300",
                  cardStyle
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-outfit">{b.category}</h3>
                    <p className="text-xs text-muted-foreground">Batas: {formatCurrency(b.amount)}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className={cn(
                      "px-3 py-1.5 rounded-xl border flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                      statusColor
                    )}>
                      {icon}
                      {statusLabel}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditModal(b)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Terpakai</span>
                      <span className="text-lg font-bold font-outfit">{formatCurrency(b.spent)}</span>
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      isOverBudget ? "text-rose-500" : isNearLimit ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>

                  <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${displayProgress}%` }}
                      className={cn(
                        "h-full transition-all duration-500",
                        progressColor
                      )}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                     <span className="text-muted-foreground">
                       {isOverBudget ? "Status: Bahaya" : isNearLimit ? "Status: Peringatan" : "Status: Aman"}
                     </span>
                     <span className={isOverBudget ? "text-rose-500" : "text-muted-foreground"}>
                       {isOverBudget 
                         ? `Lebih ${formatCurrency(b.spent - b.amount)}` 
                         : `Sisa ${formatCurrency(b.amount - b.spent)}`
                       }
                     </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-secondary/20 border-2 border-dashed rounded-3xl text-center">
            <PieChart size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-bold">Belum Ada Budget Disetel</h3>
            <p className="text-muted-foreground">Mulai atur budget bulananmu agar pengeluaran terkontrol.</p>
          </div>
        )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-card border shadow-2xl rounded-3xl p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold font-outfit">{isEditing ? 'Edit Budget' : 'Setel Budget'}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setSelectedBudget(null);
                  setAmount('');
                }} 
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Kategori</label>
                <select 
                  disabled={isEditing}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Batas Pengeluaran (Rp)</label>
                <input 
                  required
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1500000"
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary text-xl font-bold transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20"
              >
                Simpan Budget
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

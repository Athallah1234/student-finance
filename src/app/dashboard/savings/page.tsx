'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Target, 
  Trash2, 
  TrendingUp,
  X,
  PiggyBank,
  Laptop,
  Smartphone,
  Plane,
  Coins,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SavingsPage() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [addAmount, setAddAmount] = useState('');

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/savings');
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          targetAmount: Number(targetAmount), 
          targetDate, 
          note: notes
        }),
      });

      if (res.ok) {
        toast.success('Target tabungan dibuat!');
        setIsModalOpen(false);
        setName('');
        setTargetAmount('');
        setTargetDate('');
        setNotes('');
        fetchGoals();
      }
    } catch (err) {
      toast.error('Gagal menyimpan');
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/savings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedGoal._id, amount: Number(addAmount) }),
      });

      if (res.ok) {
        toast.success('Tabungan berhasil ditambahkan!');
        setIsAddMoneyOpen(false);
        setAddAmount('');
        fetchGoals();
      }
    } catch (err) {
      toast.error('Gagal menyimpan');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-outfit">Tabungan & Target</h2>
          <p className="text-muted-foreground">Wujudkan impianmu dengan menabung secara teratur.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={20} /> Buat Target Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-card border rounded-3xl animate-pulse"></div>
          ))
        ) : goals.length > 0 ? (
          goals.map((goal: any) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            


            return (
              <motion.div 
                key={goal._id}
                whileHover={{ y: -5 }}
                className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                       <Target size={24} />
                    </div>
                    <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                      {progress.toFixed(0)}% Tercapai
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{goal.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">Target: {formatCurrency(goal.targetAmount)}</p>
                  {goal.note && (
                    <p className="text-[10px] text-muted-foreground bg-secondary/50 p-2 rounded-lg italic line-clamp-2 mb-4">
                      "{goal.note}"
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-muted-foreground">{formatCurrency(goal.targetAmount - goal.currentAmount)} lagi</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                   <button 
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsAddMoneyOpen(true);
                      }}
                      className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Coins size={16} /> Tabung
                   </button>
                   <button className="p-3 bg-secondary text-muted-foreground hover:text-rose-500 rounded-xl transition-all">
                      <Trash2 size={18} />
                   </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-secondary/20 border-2 border-dashed rounded-3xl text-center">
            <PiggyBank size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-bold">Belum Ada Target Tabungan</h3>
            <p className="text-muted-foreground">Mulai buat target pertamamu sekarang!</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-card border shadow-2xl rounded-3xl p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold font-outfit">Target Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Target</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Laptop Baru, Dana Wisuda"
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nominal Target (Rp)</label>
                <input 
                  required
                  type="number" 
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="10000000"
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Tanggal (Opsional)</label>
                  <input 
                    type="date" 
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <select className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary transition-all">
                    <option value="electronics">Elektronik</option>
                    <option value="travel">Liburan</option>
                    <option value="education">Pendidikan</option>
                    <option value="emergency">Dana Darurat</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>



              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan (Opsional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan motivasi atau detail target tabunganmu..."
                  rows={3}
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20"
              >
                Buat Target
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Money Modal */}
      {isAddMoneyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsAddMoneyOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-card border shadow-2xl rounded-3xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Coins size={32} />
              </div>
              <h3 className="text-2xl font-bold font-outfit">Masukkan Tabungan</h3>
              <p className="text-sm text-muted-foreground">Untuk: {selectedGoal?.name}</p>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nominal Tabungan (Rp)</label>
                <input 
                  autoFocus
                  required
                  type="number" 
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary text-center text-2xl font-bold transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20"
              >
                Konfirmasi Tabungan
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

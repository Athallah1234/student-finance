'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  X,
  CreditCard,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('debt');
  const [deadline, setDeadline] = useState('');
  const [note, setNote] = useState('');

  const fetchDebts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/debts');
      const data = await res.json();
      setDebts(data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount: Number(amount), type, deadline, note }),
      });

      if (res.ok) {
        toast.success('Data hutang ditambahkan!');
        setIsModalOpen(false);
        setName('');
        setAmount('');
        setNote('');
        fetchDebts();
      }
    } catch (err) {
      toast.error('Gagal menyimpan');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/debts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast.success('Status diperbarui!');
        fetchDebts();
      }
    } catch (err) {
      toast.error('Gagal memperbarui');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-outfit">Hutang & Piutang</h2>
          <p className="text-muted-foreground">Catat pinjaman agar tidak lupa membayar atau menagih.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
        >
          <Plus size={20} /> Tambah Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hutang Saya */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500"><Clock size={20} /></div>
            <h3 className="text-xl font-bold font-outfit">Hutang Saya</h3>
          </div>
          <div className="space-y-4">
            {isLoading ? [1, 2].map(i => <div key={i} className="h-24 bg-card border rounded-3xl animate-pulse"></div>) : 
             debts.filter((d: any) => d.type === 'debt').map((debt: any) => (
               <DebtCard key={debt._id} debt={debt} onUpdate={updateStatus} />
             ))}
            {!isLoading && debts.filter((d: any) => d.type === 'debt').length === 0 && (
              <p className="text-sm text-muted-foreground bg-secondary/30 p-8 rounded-3xl text-center">Tidak ada hutang aktif.</p>
            )}
          </div>
        </div>

        {/* Piutang (Orang Berhutang) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><CheckCircle2 size={20} /></div>
            <h3 className="text-xl font-bold font-outfit">Piutang (Duit di Orang)</h3>
          </div>
          <div className="space-y-4">
            {isLoading ? [1, 2].map(i => <div key={i} className="h-24 bg-card border rounded-3xl animate-pulse"></div>) : 
             debts.filter((d: any) => d.type === 'receivable').map((debt: any) => (
               <DebtCard key={debt._id} debt={debt} onUpdate={updateStatus} />
             ))}
            {!isLoading && debts.filter((d: any) => d.type === 'receivable').length === 0 && (
              <p className="text-sm text-muted-foreground bg-secondary/30 p-8 rounded-3xl text-center">Tidak ada piutang aktif.</p>
            )}
          </div>
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
              <h3 className="text-2xl font-bold font-outfit">Tambah Catatan</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Orang</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama teman atau peminjam"
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nominal (Rp)</label>
                  <input 
                    required
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenis</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="debt">Hutang Saya</option>
                    <option value="receivable">Piutang (Duit di Orang)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tenggat Waktu</label>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan (Opsional)</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tambahkan detail atau alasan pinjaman..."
                  rows={3}
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-indigo-600/20"
              >
                Simpan Catatan
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DebtCard({ debt, onUpdate }: any) {
  const isPaid = debt.status === 'paid';
  
  return (
    <motion.div 
      layout
      className={cn(
        "p-5 rounded-3xl border bg-card shadow-sm group",
        isPaid ? "opacity-60 bg-secondary/30" : "hover:border-primary/30 transition-all"
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            debt.type === 'debt' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
          )}>
            <User size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">{debt.name}</h4>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold">
               <Calendar size={10} />
               <span>Deadline: {debt.deadline ? formatDate(debt.deadline) : 'Tanpa deadline'}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
           <p className={cn("font-bold", debt.type === 'debt' ? "text-rose-500" : "text-emerald-500")}>
             {formatCurrency(debt.amount)}
           </p>
        </div>
      </div>

      {debt.note && (
        <div className="mb-4 px-3 py-2 bg-secondary/50 rounded-xl">
           <p className="text-[11px] text-muted-foreground italic line-clamp-2">
             "{debt.note}"
           </p>
        </div>
      )}

      <div className="flex gap-2">
         {isPaid ? (
           <button 
              onClick={() => onUpdate(debt._id, 'unpaid')}
              className="flex-1 py-2 rounded-xl bg-secondary text-xs font-bold hover:bg-secondary/80 transition-all"
            >
              Tandai Belum Lunas
           </button>
         ) : (
           <button 
              onClick={() => onUpdate(debt._id, 'paid')}
              className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} /> Tandai Lunas
           </button>
         )}
         <button className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all"><Trash2 size={16} /></button>
      </div>
    </motion.div>
  );
}

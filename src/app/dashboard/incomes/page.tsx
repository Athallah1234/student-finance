'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp,
  X,
  Banknote,
  Gift,
  Briefcase,
  Download,
  Upload,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Calendar,
  PieChart,
  Filter,
  FilterX,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Edit3
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const incomeCategories = [
  'Uang Saku', 'Beasiswa', 'Gaji Part Time', 'Freelance', 'Jualan', 'Hadiah', 'Lainnya'
];

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<any>({ 
    data: [], 
    total: 0, 
    pages: 0, 
    currentPage: 1,
    stats: { totalAmount: 0, monthlyAmount: 0, count: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form states
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Uang Saku');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const fetchIncomes = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        category: categoryFilter,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: '10'
      });
      const res = await fetch(`/api/incomes?${queryParams}`);
      const data = await res.json();
      setIncomes(data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortButton = ({ field, label, align = 'left' }: { field: string, label: string, align?: 'left' | 'right' | 'center' }) => {
    const isActive = sortBy === field;
    return (
      <button 
        onClick={() => toggleSort(field)}
        className={cn(
          "flex items-center gap-1 hover:text-foreground transition-colors group w-full",
          align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start',
          isActive && "text-foreground"
        )}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        {isActive ? (
          sortOrder === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
        ) : (
          <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

  const resetFilters = () => {
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(incomes.data.map((inc: any) => inc._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} data terpilih?`)) return;
    try {
      const res = await fetch(`/api/incomes?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Data terpilih berhasil dihapus');
        setSelectedIds([]);
        fetchIncomes();
      }
    } catch (err) {
      toast.error('Gagal menghapus data');
    }
  };

  const exportToCSV = () => {
    if (incomes.data.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const headers = ['Sumber,Kategori,Tanggal,Nominal'];
    const rows = incomes.data.map((inc: any) => 
      `"${inc.source}","${inc.category}","${new Date(inc.date).toLocaleDateString()}",${inc.amount}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pemasukan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil diunduh');
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n');
      const data = [];

      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple regex to handle quoted values
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length >= 4) {
          data.push({
            source: parts[0].replace(/"/g, ''),
            category: parts[1].replace(/"/g, ''),
            date: new Date(parts[2].replace(/"/g, '')).toISOString(),
            amount: Number(parts[3])
          });
        }
      }

      if (data.length > 0) {
        try {
          const res = await fetch('/api/incomes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (res.ok) {
            toast.success(`Berhasil mengimpor ${data.length} data`);
            fetchIncomes();
          }
        } catch (error) {
          toast.error('Gagal mengimpor data');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    setPage(1); // Reset to first page on filter change
  }, [search, categoryFilter, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchIncomes();
  }, [search, page, categoryFilter, startDate, endDate, sortBy, sortOrder]);

  const handleEdit = (inc: any) => {
    setEditingIncome(inc);
    setSource(inc.source);
    setAmount(inc.amount.toString());
    setCategory(inc.category);
    setDate(new Date(inc.date).toISOString().split('T')[0]);
    setNotes(inc.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/incomes';
      const method = editingIncome ? 'PUT' : 'POST';
      const body = { 
        source, 
        amount: Number(amount), 
        category, 
        date, 
        note: notes,
        ...(editingIncome && { id: editingIncome._id })
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingIncome ? 'Pemasukan diperbarui' : 'Pemasukan ditambahkan');
        setIsModalOpen(false);
        setEditingIncome(null);
        setSource('');
        setAmount('');
        setNotes('');
        fetchIncomes();
      }
    } catch (err) {
      toast.error('Gagal menyimpan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pemasukan ini?')) return;
    try {
      const res = await fetch(`/api/incomes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Dihapus');
        fetchIncomes();
      }
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      {/* Bulk Delete Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-card border shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6 min-w-[300px]"
          >
            <p className="text-sm font-bold">
              <span className="text-primary">{selectedIds.length}</span> Item Terpilih
            </p>
            <div className="h-6 w-px bg-border"></div>
            <button 
              onClick={handleBulkDelete}
              className="text-rose-500 font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-all"
            >
              <Trash2 size={18} /> Hapus Semua
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-muted-foreground font-bold text-sm hover:text-foreground transition-all"
            >
              Batal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-outfit">Pemasukan</h2>
          <p className="text-muted-foreground">Catat setiap uang masuk untuk memantau saldo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv"
            onChange={handleImportCSV} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-secondary text-foreground px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-secondary/80 transition-all"
          >
            <Upload size={20} /> Import CSV
          </button>
          <button 
            onClick={exportToCSV}
            className="bg-secondary text-foreground px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-secondary/80 transition-all"
          >
            <Download size={20} /> Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            <Plus size={20} /> Tambah Baru
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border p-6 rounded-3xl shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Pemasukan</p>
          <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(incomes.stats?.totalAmount || 0)}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 font-bold">
             <span className="bg-emerald-500/10 px-2 py-1 rounded-lg">Seluruh Waktu</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border p-6 rounded-3xl shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Bulan Ini</p>
          <h3 className="text-2xl font-bold text-primary">{formatCurrency(incomes.stats?.monthlyAmount || 0)}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
             <span className="bg-primary/10 px-2 py-1 rounded-lg">{new Date().toLocaleString('id-ID', { month: 'long' })}</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border p-6 rounded-3xl shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <PieChart size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Transaksi</p>
          <h3 className="text-2xl font-bold">{incomes.stats?.count || 0}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground font-bold">
             <span className="bg-secondary px-2 py-1 rounded-lg">Data Tercatat</span>
          </div>
        </motion.div>
      </div>

      {/* Filter Section */}
      <div className="bg-card border p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Cari sumber pemasukan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/50 rounded-2xl outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-secondary/50 border rounded-2xl text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">Semua Kategori</option>
            {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2 bg-secondary/50 border rounded-2xl px-3 py-1.5">
             <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Dari</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-sm outline-hidden cursor-pointer"
                />
             </div>
             <div className="h-8 w-px bg-border"></div>
             <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Sampai</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-sm outline-hidden cursor-pointer"
                />
             </div>
          </div>
          <button 
            onClick={resetFilters}
            className="p-3 bg-secondary/50 hover:bg-secondary rounded-2xl text-muted-foreground hover:text-foreground transition-all"
            title="Reset Filter"
          >
            <FilterX size={20} />
          </button>
        </div>
      </div>

      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 border-b">
                <th className="px-6 py-4 w-10">
                   <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={incomes.data.length > 0 && selectedIds.length === incomes.data.length}
                    className="w-4 h-4 rounded-sm border-gray-300 text-primary focus:ring-primary"
                   />
                </th>
                <th className="px-6 py-4">
                   <SortButton field="source" label="Sumber" />
                </th>
                <th className="px-6 py-4">
                   <SortButton field="category" label="Kategori" />
                </th>
                <th className="px-6 py-4">
                   <SortButton field="date" label="Tanggal" />
                </th>
                <th className="px-6 py-4">
                   <SortButton field="amount" label="Nominal" align="right" />
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-secondary rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : incomes.data.length > 0 ? (
                incomes.data.map((inc: any) => (
                  <tr 
                    key={inc._id} 
                    className={cn(
                      "hover:bg-emerald-500/5 transition-all group",
                      selectedIds.includes(inc._id) && "bg-emerald-500/5"
                    )}
                  >
                    <td className="px-6 py-4">
                       <input 
                        type="checkbox" 
                        checked={selectedIds.includes(inc._id)}
                        onChange={() => toggleSelect(inc._id)}
                        className="w-4 h-4 rounded-sm border-gray-300 text-primary focus:ring-primary"
                       />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Banknote size={18} />
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-sm">{inc.source}</span>
                            {inc.note && <p className="text-[10px] text-muted-foreground line-clamp-1 italic">"{inc.note}"</p>}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase">
                        {inc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(inc.date)}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">+{formatCurrency(inc.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                         <button 
                            onClick={() => handleEdit(inc)}
                            className="p-2 hover:bg-emerald-500/10 text-emerald-600 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                         </button>
                         <button 
                            onClick={() => handleDelete(inc._id)}
                            className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 grayscale opacity-50">
                      <TrendingUp size={48} />
                      <p className="text-muted-foreground font-medium">Belum ada catatan pemasukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-card border shadow-2xl rounded-3xl p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold font-outfit">
                {editingIncome ? 'Edit Pemasukan' : 'Tambah Pemasukan'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingIncome(null);
                  setSource('');
                  setAmount('');
                  setNotes('');
                }} 
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sumber Pemasukan</label>
                <input 
                  required
                  type="text" 
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Contoh: Transfer Orang Tua, Gaji Part Time"
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
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
                    placeholder="1000000"
                    className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {incomeCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan (Opsional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan keterangan tambahan jika ada..."
                  rows={3}
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20"
              >
                {editingIncome ? 'Simpan Perubahan' : 'Simpan Pemasukan'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

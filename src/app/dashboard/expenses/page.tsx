'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Download,
  CreditCard,
  Utensils,
  Car,
  Home,
  Coffee,
  MoreVertical,
  X,
  Upload,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FilterX,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const categoryConfig: Record<string, { icon: any, color: string }> = {
  'Makan': { icon: Utensils, color: 'text-orange-500 bg-orange-500/10' },
  'Minum': { icon: Coffee, color: 'text-blue-500 bg-blue-500/10' },
  'Kos': { icon: Home, color: 'text-purple-500 bg-purple-500/10' },
  'Transportasi': { icon: Car, color: 'text-cyan-500 bg-cyan-500/10' },
  'Kuliah': { icon: CreditCard, color: 'text-indigo-500 bg-indigo-500/10' },
  'Buku': { icon: CreditCard, color: 'text-emerald-500 bg-emerald-500/10' },
  'Nongkrong': { icon: Coffee, color: 'text-rose-500 bg-rose-500/10' },
  'Hiburan': { icon: CreditCard, color: 'text-pink-500 bg-pink-500/10' },
  'Belanja': { icon: CreditCard, color: 'text-amber-500 bg-amber-500/10' },
  'Lainnya': { icon: MoreVertical, color: 'text-slate-500 bg-slate-500/10' },
};

const categories = [
  'Makan', 'Minum', 'Kos', 'Transportasi', 'Kuliah', 'Buku', 'Nongkrong', 'Hiburan', 'Belanja', 'Lainnya'
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any>({ data: [], total: 0, pages: 0, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Makan');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const fetchExpenses = async () => {
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
      const res = await fetch(`/api/expenses?${queryParams}`);
      const data = await res.json();
      setExpenses(data);
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
      setSelectedIds(expenses.data.map((ex: any) => ex._id));
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
      const res = await fetch(`/api/expenses?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Data terpilih berhasil dihapus');
        setSelectedIds([]);
        fetchExpenses();
      }
    } catch (err) {
      toast.error('Gagal menghapus data');
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n');
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length >= 4) {
          data.push({
            title: parts[0].replace(/"/g, ''),
            category: parts[1].replace(/"/g, ''),
            date: new Date(parts[2].replace(/"/g, '')).toISOString(),
            amount: Number(parts[3])
          });
        }
      }

      if (data.length > 0) {
        try {
          const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (res.ok) {
            toast.success(`Berhasil mengimpor ${data.length} pengeluaran`);
            fetchExpenses();
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
    fetchExpenses();
  }, [search, page, categoryFilter, startDate, endDate, sortBy, sortOrder]);

  const handleEdit = (ex: any) => {
    setEditingExpense(ex);
    setTitle(ex.title);
    setAmount(ex.amount.toString());
    setCategory(ex.category);
    setDate(new Date(ex.date).toISOString().split('T')[0]);
    setNotes(ex.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';
      const body = { 
        title, 
        amount: Number(amount), 
        category, 
        date, 
        note: notes,
        ...(editingExpense && { id: editingExpense._id })
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingExpense ? 'Pengeluaran diperbarui' : 'Pengeluaran ditambahkan');
        setIsModalOpen(false);
        setEditingExpense(null);
        setTitle('');
        setAmount('');
        setNotes('');
        fetchExpenses();
      }
    } catch (err) {
      toast.error('Gagal menyimpan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Dihapus');
        fetchExpenses();
      }
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  const exportToCSV = () => {
    if (expenses.data.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const headers = ['Transaksi,Kategori,Tanggal,Nominal'];
    const rows = expenses.data.map((ex: any) => 
      `"${ex.title}","${ex.category}","${new Date(ex.date).toLocaleDateString()}",${ex.amount}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pengeluaran_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil diunduh');
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
              <span className="text-rose-500">{selectedIds.length}</span> Item Terpilih
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
          <h2 className="text-3xl font-bold font-outfit">Pengeluaran</h2>
          <p className="text-muted-foreground">Catat dan pantau setiap pengeluaran kampusmu.</p>
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
            className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus size={20} /> Tambah Baru
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <CreditCard size={80} />
          </div>
          <p className="text-muted-foreground text-sm font-medium text-rose-500">Total Pengeluaran</p>
          <h3 className="text-3xl font-bold font-outfit mt-1 text-rose-500">
            {formatCurrency(expenses.data.reduce((acc: number, curr: any) => acc + curr.amount, 0))}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">Menampilkan {expenses.data.length} transaksi</p>
        </div>
        
        <div className="bg-card border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Filter size={80} />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Rata-rata / Transaksi</p>
          <h3 className="text-3xl font-bold font-outfit mt-1">
            {formatCurrency(expenses.data.length > 0 ? expenses.data.reduce((acc: number, curr: any) => acc + curr.amount, 0) / expenses.data.length : 0)}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">Berdasarkan halaman ini</p>
        </div>

        <div className="bg-card border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Plus size={80} />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Total Data</p>
          <h3 className="text-3xl font-bold font-outfit mt-1">
            {expenses.total || 0}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">Seluruh catatan pengeluaran</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-card border p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/50 rounded-2xl outline-hidden focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-secondary/50 border rounded-2xl text-sm outline-hidden focus:ring-2 focus:ring-primary"
          >
            <option value="All">Semua Kategori</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
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

      {/* Expenses Table/List */}
      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 border-b">
                <th className="px-6 py-4 w-10">
                   <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={expenses.data.length > 0 && selectedIds.length === expenses.data.length}
                    className="w-4 h-4 rounded-sm border-gray-300 text-primary focus:ring-primary"
                   />
                </th>
                <th className="px-6 py-4">
                   <SortButton field="title" label="Transaksi" />
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
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-secondary rounded-full w-full"></div></td>
                  </tr>
                ))
              ) : expenses.data.length > 0 ? (
                expenses.data.map((ex: any) => (
                  <tr 
                    key={ex._id} 
                    className={cn(
                      "hover:bg-secondary/20 transition-all group",
                      selectedIds.includes(ex._id) && "bg-rose-500/5"
                    )}
                  >
                    <td className="px-6 py-4">
                       <input 
                        type="checkbox" 
                        checked={selectedIds.includes(ex._id)}
                        onChange={() => toggleSelect(ex._id)}
                        className="w-4 h-4 rounded-sm border-gray-300 text-primary focus:ring-primary"
                       />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                           categoryConfig[ex.category]?.color || 'bg-secondary text-primary'
                         )}>
                            {(() => {
                              const Icon = categoryConfig[ex.category]?.icon || CreditCard;
                              return <Icon size={18} />;
                            })()}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-sm">{ex.title}</span>
                            <span className="text-[10px] text-muted-foreground md:hidden uppercase tracking-wider">{ex.category}</span>
                            {ex.note && <p className="text-[10px] text-muted-foreground line-clamp-1 italic">"{ex.note}"</p>}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                        categoryConfig[ex.category]?.color || 'bg-primary/10 text-primary'
                      )}>
                        {ex.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(ex.date)}</td>
                    <td className="px-6 py-4 text-right font-bold text-rose-500">-{formatCurrency(ex.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                         <button 
                            onClick={() => handleEdit(ex)}
                            className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                         </button>
                         <button 
                            onClick={() => handleDelete(ex._id)}
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
                      <Utensils size={48} />
                      <p className="text-muted-foreground font-medium">Belum ada catatan pengeluaran</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {expenses.pages > 1 && (
          <div className="px-6 py-4 bg-secondary/10 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan {expenses.data.length} dari {expenses.total} data
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-secondary rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronLeftIcon size={18} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(expenses.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                      page === i + 1 ? "bg-primary text-white" : "hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(expenses.pages, p + 1))}
                disabled={page === expenses.pages}
                className="p-2 hover:bg-secondary rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronRightIcon size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-md" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingExpense(null);
                setTitle('');
                setAmount('');
                setNotes('');
              }}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-lg bg-card border shadow-2xl rounded-[2.5rem] p-8 md:p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-bold font-outfit">
                    {editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingExpense ? 'Perbarui detail transaksi pengeluaranmu.' : 'Lacak pengeluaran harianmu dengan mudah.'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingExpense(null);
                    setTitle('');
                    setAmount('');
                    setNotes('');
                  }} 
                  className="p-3 hover:bg-secondary rounded-2xl transition-all hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold px-1 text-muted-foreground">Apa yang dibeli?</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-primary/10 rounded-lg text-primary">
                      <Utensils size={18} />
                    </div>
                    <input 
                      required
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Nasi Goreng, Buku Fotokopi"
                      className="w-full pl-14 pr-4 py-4 bg-secondary/30 border-transparent focus:border-primary/20 rounded-[1.25rem] outline-hidden focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold px-1 text-muted-foreground">Nominal (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                      <input 
                        required
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="25000"
                        className="w-full pl-12 pr-4 py-4 bg-secondary/30 border-transparent focus:border-primary/20 rounded-[1.25rem] outline-hidden focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold px-1 text-muted-foreground">Kategori</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-4 bg-secondary/30 border-transparent focus:border-primary/20 rounded-[1.25rem] outline-hidden focus:ring-4 focus:ring-primary/10 transition-all font-medium appearance-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold px-1 text-muted-foreground">Tanggal</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-4 bg-secondary/30 border-transparent focus:border-primary/20 rounded-[1.25rem] outline-hidden focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold px-1 text-muted-foreground">Catatan (Opsional)</label>
                  <textarea 
                    placeholder="Tambahkan keterangan tambahan..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-4 bg-secondary/30 border-transparent focus:border-primary/20 rounded-[1.25rem] outline-hidden focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-bold text-lg hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/30 mt-4"
                >
                  {editingExpense ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

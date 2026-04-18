'use client';

import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Camera, 
  Settings, 
  Shield, 
  CheckCircle2,
  X,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profil berhasil diperbarui!');
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-bold font-outfit">Profil Saya</h2>
        <p className="text-muted-foreground">Kelola informasi pribadi dan preferensi akunmu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card - Avatar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border rounded-3xl p-8 text-center shadow-sm">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-background shadow-xl">
                {session?.user?.name?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-all border-2 border-background">
                <Camera size={18} />
              </button>
            </div>
            <h3 className="text-xl font-bold">{session?.user?.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{session?.user?.email}</p>
            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center justify-center gap-1 w-fit mx-auto">
              <CheckCircle2 size={12} /> Akun Terverifikasi
            </span>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-2">
            <button 
              onClick={() => setActiveModal('security')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-all text-sm font-medium"
            >
              <Shield size={18} className="text-muted-foreground" /> Keamanan Akun
            </button>
          </div>
        </div>

        {/* Right Card - Details Form */}
        <div className="md:col-span-2">
          <div className="bg-card border rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold font-outfit flex items-center gap-2">
                <Settings size={20} className="text-primary" /> Informasi Pribadi
              </h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-bold text-primary hover:underline"
              >
                {isEditing ? 'Batal' : 'Edit Profil'}
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input 
                      disabled={!isEditing}
                      defaultValue={session?.user?.name || ''}
                      className="w-full pl-10 pr-4 py-3 bg-secondary/30 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input 
                      disabled
                      defaultValue={session?.user?.email || ''}
                      className="w-full pl-10 pr-4 py-3 bg-secondary/30 border rounded-2xl outline-hidden disabled:opacity-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Kampus</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input 
                    disabled={!isEditing}
                    placeholder="Contoh: Universitas Gadjah Mada"
                    className="w-full pl-10 pr-4 py-3 bg-secondary/30 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Jurusan</label>
                  <input 
                    disabled={!isEditing}
                    placeholder="Contoh: Manajemen Keuangan"
                    className="w-full px-4 py-3 bg-secondary/30 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Semester</label>
                  <select 
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-secondary/30 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              {isEditing && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
                >
                  Simpan Perubahan
                </motion.button>
              )}
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal === 'security' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-md"
              onClick={() => setActiveModal(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border rounded-[2rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-outfit">Keamanan Akun</h3>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-secondary rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Password Saat Ini</label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                       <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-secondary/30 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Password Baru</label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                       <input type="password" placeholder="Minimal 8 karakter" className="w-full pl-10 pr-4 py-3 bg-secondary/30 border rounded-2xl outline-hidden focus:ring-2 focus:ring-primary" />
                    </div>
                 </div>
                 <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20">
                    Update Password
                 </button>
              </div>
            </motion.div>
          </div>
        )}


      </AnimatePresence>
    </div>
  );
}


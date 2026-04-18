'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Wallet, Mail, Lock, User, GraduationCap, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  university: z.string().optional(),
  major: z.string().optional(),
  semester: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran berhasil! Silakan masuk.');
        router.push('/login');
      } else {
        toast.error(result.message || 'Terjadi kesalahan saat mendaftar');
      }
    } catch (error) {
      toast.error('Koneksi bermasalah. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-outfit">MahasiswaFinance</span>
          </Link>
          <h1 className="text-3xl font-bold font-outfit">Buat Akun Baru</h1>
          <p className="text-muted-foreground mt-2">Mulai kelola keuanganmu sekarang secara gratis</p>
        </div>

        <div className="bg-card border p-8 rounded-3xl shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium px-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    {...register('name')}
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-2xl focus:ring-2 focus:ring-primary outline-hidden transition-all"
                    placeholder="Budi Santoso"
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive px-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium px-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-2xl focus:ring-2 focus:ring-primary outline-hidden transition-all"
                    placeholder="budi@kampus.ac.id"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive px-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium px-1">Kampus</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  {...register('university')}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-2xl focus:ring-2 focus:ring-primary outline-hidden transition-all"
                  placeholder="Universitas Indonesia"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium px-1">Jurusan</label>
                <input
                  {...register('major')}
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl focus:ring-2 focus:ring-primary outline-hidden transition-all"
                  placeholder="Teknik Informatika"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium px-1">Semester</label>
                <select
                  {...register('semester')}
                  className="w-full px-4 py-3 bg-secondary/50 border rounded-2xl focus:ring-2 focus:ring-primary outline-hidden transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                    <option key={s} value={s.toString()}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-2xl focus:ring-2 focus:ring-primary outline-hidden transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-destructive px-1">{errors.password.message}</p>}
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buat Akun Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Masuk Disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

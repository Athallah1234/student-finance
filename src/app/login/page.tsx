'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Wallet, Mail, Lock, Loader2 } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const loginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Berhasil masuk!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-outfit">MahasiswaFinance</span>
          </Link>
          <h1 className="text-3xl font-bold font-outfit">Selamat Datang Kembali</h1>
          <p className="text-muted-foreground mt-2">Masuk untuk mengelola keuanganmu</p>
        </div>

        <div className="bg-card border p-8 rounded-3xl shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-2xl focus:ring-2 focus:ring-primary outline-hidden transition-all"
                  placeholder="nama@kampus.ac.id"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive px-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Lupa password?</Link>
              </div>
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
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Atau lanjut dengan</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => signIn('google')}
              className="flex items-center justify-center gap-2 py-3 border rounded-2xl hover:bg-secondary transition-all font-medium"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Google
            </button>
            <button 
              onClick={() => signIn('github')}
              className="flex items-center justify-center gap-2 py-3 border rounded-2xl hover:bg-secondary transition-all font-medium"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Daftar Gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

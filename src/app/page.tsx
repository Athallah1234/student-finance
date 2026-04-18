'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Wallet, 
  PieChart, 
  Target, 
  Bell, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-outfit tracking-tight">
                Mahasiswa<span className="text-primary">Finance</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="#features" className="hover:text-primary transition-colors">Fitur</Link>
              <Link href="#testimonials" className="hover:text-primary transition-colors">Testimoni</Link>
              <Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href="/login" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Masuk
              </Link>
              <Link 
                href="/register" 
                className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
              >
                Mulai Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6 inline-block border border-primary/20">
              #1 Aplikasi Keuangan Mahasiswa
            </span>
            <h1 className="text-5xl md:text-7xl font-bold font-outfit mb-6 tracking-tight">
              Kelola Keuangan Mahasiswa <br />
              <span className="text-gradient">Lebih Mudah & Cerdas</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Catat pemasukan, pengeluaran, tabungan, uang kos, hingga target keuangan dalam satu dashboard modern yang dirancang khusus untuk kebutuhan kampusmu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/register" 
                className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-primary/30"
              >
                Coba Sekarang <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/demo" 
                className="bg-secondary text-secondary-foreground px-8 py-4 rounded-2xl text-lg font-bold hover:bg-secondary/80 transition-all"
              >
                Lihat Demo
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute -inset-4 bg-linear-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
            <div className="relative bg-card border rounded-3xl p-4 shadow-2xl overflow-hidden aspect-video max-w-5xl mx-auto group">
               {/* Dashboard Mockup - Placeholder UI */}
               <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 rounded-2xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <PieChart className="w-20 h-20 text-primary opacity-20 group-hover:scale-110 transition-transform" />
                    <p className="text-muted-foreground font-medium italic">Interactive Dashboard Preview</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4">Fitur Unggulan Untukmu</h2>
            <p className="text-muted-foreground">Semua yang kamu butuhkan untuk mencapai financial freedom dari bangku kuliah.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="text-yellow-500" />}
              title="Input Super Cepat"
              description="Catat pengeluaran kopi atau fotokopi hanya dalam hitungan detik."
            />
            <FeatureCard 
              icon={<PieChart className="text-blue-500" />}
              title="Analitik Visual"
              description="Lihat kemana uangmu pergi dengan grafik interaktif yang mudah dipahami."
            />
            <FeatureCard 
              icon={<Target className="text-emerald-500" />}
              title="Target Tabungan"
              description="Mimpi beli laptop baru atau liburan? Kami bantu hitung progressnya."
            />
            <FeatureCard 
              icon={<Bell className="text-purple-500" />}
              title="Reminder Tagihan"
              description="Jangan lewatkan bayar kos atau UKT lagi dengan notifikasi otomatis."
            />
            <FeatureCard 
              icon={<TrendingUp className="text-primary" />}
              title="AI Financial Insights"
              description="Dapatkan saran penghematan cerdas berdasarkan pola belanjamu."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-indigo-500" />}
              title="Keamanan Terjamin"
              description="Data keuanganmu aman terenkripsi dengan standar keamanan tinggi."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Kata Teman Mahasiswa</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <TestimonialCard 
                  name="Rizky"
                  campus="Universitas Indonesia"
                  quote="Dulu uang bulanan habis entah kemana. Sekarang tiap rupiah terpantau rapi!"
               />
               <TestimonialCard 
                  name="Sari"
                  campus="ITB Bandung"
                  quote="Fitur target tabungannya ngebantu banget pas mau beli laptop buat skripsi."
               />
               <TestimonialCard 
                  name="Andi"
                  campus="UGM Yogyakarta"
                  quote="Dashboardnya keren banget, serasa pake aplikasi fintech profesional tapi gratis."
               />
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 font-outfit">Siap Menjadi Mahasiswa Cerdas Finansial?</h2>
          <Link 
            href="/register" 
            className="bg-white text-primary px-10 py-5 rounded-3xl text-xl font-bold hover:scale-105 transition-all inline-block shadow-2xl"
          >
            Mulai Sekarang - Gratis Selamanya
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold font-outfit">MahasiswaFinance</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary">Syarat & Ketentuan</Link>
            <Link href="#" className="hover:text-primary">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-primary">Hubungi Kami</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 MahasiswaFinance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-card border rounded-3xl shadow-sm hover:shadow-xl transition-all"
    >
      <div className="w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function TestimonialCard({ name, campus, quote }: { name: string, campus: string, quote: string }) {
  return (
    <div className="p-8 bg-background border rounded-3xl italic relative">
      <p className="text-lg mb-6">"{quote}"</p>
      <div>
        <h4 className="font-bold not-italic">{name}</h4>
        <p className="text-sm text-muted-foreground not-italic">{campus}</p>
      </div>
    </div>
  );
}

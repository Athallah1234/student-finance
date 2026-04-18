'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Target, 
  CreditCard, 
  PieChart, 
  User, 
  LogOut,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ArrowUpCircle, label: 'Pemasukan', href: '/dashboard/incomes' },
  { icon: ArrowDownCircle, label: 'Pengeluaran', href: '/dashboard/expenses' },
  { icon: PieChart, label: 'Budget', href: '/dashboard/budgets' },
  { icon: Target, label: 'Tabungan', href: '/dashboard/savings' },
  { icon: CreditCard, label: 'Hutang', href: '/dashboard/debts' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full border-r transition-all duration-300 z-50 flex flex-col",
          "bg-card/80 backdrop-blur-xl", // Glassmorphism effect
          // Desktop behavior
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile behavior
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={cn("flex items-center gap-2 overflow-hidden", isCollapsed && "lg:hidden")}>
            <div className="bg-primary p-1.5 rounded-lg shrink-0">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold font-outfit truncate">MahasiswaFinance</span>
          </div>
          
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 hover:bg-secondary rounded-lg transition-colors ml-auto"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={22} className={cn("shrink-0", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                <span className={cn("font-medium text-sm", isCollapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t space-y-2">
          <Link 
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all",
              isCollapsed && "lg:justify-center"
            )}
          >
            <User size={22} className="text-muted-foreground" />
            <span className={cn("font-medium text-sm", isCollapsed && "lg:hidden")}>Profil Saya</span>
          </Link>
          <div className={cn("flex items-center gap-3 px-3 py-3", isCollapsed && "lg:justify-center")}>
            <ThemeToggle />
            <span className={cn("text-sm font-medium", isCollapsed && "lg:hidden")}>Tema</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-all",
              isCollapsed && "lg:justify-center"
            )}
          >
            <LogOut size={22} />
            <span className={cn("font-medium text-sm", isCollapsed && "lg:hidden")}>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}

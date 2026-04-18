'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import NotificationManager from './NotificationManager';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 min-w-0",
        isCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-8 bg-card/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-secondary rounded-xl lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-bold font-outfit text-lg hidden md:block">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <button className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors hidden sm:flex">
              <Search size={20} />
            </button>
            <button className="p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-card"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-2 md:pl-4 border-l">
               <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold truncate max-w-[120px]">{session?.user?.name}</span>
                  <span className="text-[10px] text-muted-foreground">Mahasiswa Aktif</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <span className="text-primary font-bold">{session?.user?.name?.[0]}</span>
               </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
      <NotificationManager />
    </div>
  );
}

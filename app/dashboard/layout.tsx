'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, setCurrentUser } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Set initial state and handle resize
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  useEffect(() => {
    // Close sidebar on route change on mobile
    if (window.innerWidth < 1024) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  if (!currentUser) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/');
  };

  const userRole = currentUser?.role?.trim();
  const menuItems = [
    { 
      name: 'Home', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['Administrador', 'Supervisor', 'Jovem aprendiz']
    },
    { 
      name: 'Romaneios', 
      href: '/dashboard/romaneios', 
      icon: FileText,
      roles: ['Administrador', 'Supervisor', 'Jovem aprendiz']
    },
    { 
      name: 'Atividades', 
      href: '/dashboard/atividades', 
      icon: CheckSquare,
      roles: ['Administrador', 'Supervisor', 'Jovem aprendiz']
    },
    { 
      name: 'Configurações', 
      href: '/dashboard/configuracoes', 
      icon: Settings,
      roles: ['Administrador']
    },
  ].filter(item => userRole && item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0",
          !isSidebarOpen && "lg:w-20"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2 overflow-hidden">
              {isSidebarOpen && (
                <div className="overflow-hidden whitespace-nowrap">
                  <h1 className="font-bold text-slate-800 text-sm leading-tight">Santa Rosa</h1>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Filial 3</p>
                </div>
              )}
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-[#046393] text-white shadow-lg shadow-blue-900/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#046393]"
                  )}
                >
                  <item.icon size={22} className={cn(isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                  {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                  {isActive && isSidebarOpen && <ChevronRight size={16} className="ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-2",
              !isSidebarOpen && "justify-center"
            )}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#046393]">
                <UserIcon size={20} />
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{currentUser.role}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group",
                !isSidebarOpen && "justify-center"
              )}
            >
              <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
              {isSidebarOpen && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status do Sistema</span>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

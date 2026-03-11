'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import Link from 'next/link';
import { LogIn, User as UserIcon, Lock, AlertCircle, Shirt } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const [role, setRole] = useState<UserRole | ''>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setCurrentUser, currentUser } = useAppStore();
  const [isSupabaseConfigured] = useState(() => {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return hasUrl && hasKey;
  });

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Por favor, selecione um tipo de usuário.');
      return;
    }

    if (role === 'Administrador' && password !== 'Bak33542772') {
      setError('Senha de administrador incorreta.');
      return;
    }

    setIsLoading(true);

    try {
      // Create a mock user object based on the selection
      // In a real app, we might still want to sign in to Supabase with a generic account
      // for RLS, but for this simplified request, we'll just set the store.
      const mockUser = {
        id: role === 'Administrador' 
          ? '00000000-0000-0000-0000-000000000001' 
          : role === 'Supervisor' 
            ? '00000000-0000-0000-0000-000000000002' 
            : '00000000-0000-0000-0000-000000000003',
        username: role.toLowerCase().replace(' ', '.'),
        name: role,
        role: role as UserRole,
      };

      setCurrentUser(mockUser);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Erro ao acessar o sistema');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#046393] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 relative mb-4">
              <Image 
                src="/assets/logo.png" 
                alt="Santa Rosa Logo" 
                fill 
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 text-center">
              Santa Rosa Malhas
            </h1>
            <p className="text-slate-500 font-medium">Acesso Rápido - Filial 3</p>
          </div>

          <form onSubmit={handleAccess} className="space-y-6">
            {!isSupabaseConfigured && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle size={16} />
                  Atenção: Sistema Offline
                </div>
                <p>As chaves do Supabase não foram configuradas. O banco de dados não funcionará.</p>
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-2 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Tipo de Usuário</label>
              <div className="grid grid-cols-1 gap-3">
                {(['Administrador', 'Supervisor', 'Jovem aprendiz'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setError('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                      role === r 
                        ? 'border-[#046393] bg-blue-50 text-[#046393]' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="font-bold">{r}</span>
                    {role === r && <div className="w-2 h-2 bg-[#046393] rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            {role === 'Administrador' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-slate-700 ml-1">Senha de Admin</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046393] focus:border-transparent transition-all"
                    placeholder="Digite a senha"
                    required
                  />
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#046393] hover:bg-[#03527a] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Acessar Sistema
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Sistema de Gestão Interna
          </p>
        </div>
      </motion.div>
    </div>
  );
}

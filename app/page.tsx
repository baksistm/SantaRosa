'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import Link from 'next/link';
import { LogIn, User as UserIcon, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setCurrentUser, currentUser, users, addUser } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (authError) throw authError;

      if (data.user) {
        // Fetch profile from Supabase to get the 'function' (role)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Map 'function' from DB to our local 'role'
        const dbRole = (profile?.function?.trim() || 'Jovem aprendiz') as UserRole;

        // Check if user exists in our local store
        let localUser = users.find(u => u.id === data.user.id);

        if (!localUser) {
          localUser = {
            id: data.user.id,
            username: profile?.username || data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user',
            name: profile?.name || data.user.user_metadata?.name || data.user.email || 'Usuário',
            role: dbRole,
          };
          addUser(localUser);
        } else {
          // Update local role from DB
          localUser.role = dbRole;
          localUser.name = profile?.name || localUser.name;
          localUser.username = profile?.username || localUser.username;
          updateUser(localUser);
        }

        setCurrentUser(localUser);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar no sistema');
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
            <Logo size={96} variant="standard" className="mb-4 shadow-xl shadow-blue-900/10" />
            <h1 className="text-2xl font-bold text-[#046393] text-center">
              Santa Rosa Malhas
            </h1>
            <p className="text-slate-500 font-medium">Filial 3</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
              <label className="text-sm font-semibold text-slate-700 ml-1">E-mail</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046393] focus:border-transparent transition-all"
                  placeholder="Seu e-mail"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#046393] focus:border-transparent transition-all"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#046393] hover:bg-[#03527a] text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar no Sistema
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

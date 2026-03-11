'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabase-service';
import { motion } from 'motion/react';
import Link from 'next/link';
import { LogIn, User as UserIcon, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setCurrentUser, currentUser } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('password', password);

      if (fetchError) throw fetchError;

      if (profiles && profiles.length > 0) {
        const user = profiles[0];
        setCurrentUser({
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.function as UserRole,
        });
        router.push('/dashboard');
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Erro ao acessar o sistema. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await supabaseService.createRegistrationRequest({
        name: fullName,
        username: username,
        password: password
      });
      setSuccess('Solicitação enviada! Aguarde a aprovação do administrador.');
      setIsRegistering(false);
      setFullName('');
      setUsername('');
      setPassword('');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message?.includes('unique') ? 'Este usuário já está em uso.' : 'Erro ao enviar solicitação.');
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
          <div className="flex flex-col items-center mb-4">
            <div className="w-32 h-32 relative -mb-4">
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
            <p className="text-slate-500 font-medium">Filial 3 - Gestão Interna</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-2 text-sm"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center gap-2 text-sm"
            >
              <CheckCircle size={18} className="text-emerald-500" />
              {success}
            </motion.div>
          )}

          <form onSubmit={isRegistering ? handleRegisterRequest : handleLogin} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none transition-all"
                    placeholder="Seu nome"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Usuário</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none transition-all"
                  placeholder="nome.usuario"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#046393] hover:bg-[#03527a] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  {isRegistering ? 'Solicitar Cadastro' : 'Acessar Sistema'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
              }}
              className="text-sm font-bold text-[#046393] hover:underline"
            >
              {isRegistering ? 'Já tenho conta? Fazer Login' : 'Não tem conta? Solicitar Cadastro'}
            </button>
          </div>
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

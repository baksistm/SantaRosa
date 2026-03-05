'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabase-service';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Edit2, 
  Trash2, 
  Lock, 
  User as UserIcon,
  Check,
  X,
  AlertCircle,
  Mail,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function ConfiguracoesPage() {
  const { currentUser, users, updateUser, deleteUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'acessos'>('usuarios');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'Jovem aprendiz' as UserRole
  });

  // No more database fetching - using Zustand store directly

  if (currentUser?.role !== 'Administrador') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Lock size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Acesso Restrito</h1>
        <p className="text-slate-500">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!editingId) {
        setError('Para criar novos usuários, use o link de cadastro na tela inicial.');
        setIsLoading(false);
        return;
      }

      // Update directly in the Zustand store (localStorage)
      updateUser({
        id: editingId,
        name: formData.name,
        username: formData.username,
        role: formData.role
      });

      alert('Alterações salvas com sucesso!');
      setFormData({ name: '', username: '', email: '', password: '', role: 'Jovem aprendiz' });
      setIsAdding(false);
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setFormData({
      name: user.name,
      username: user.username,
      email: '', // Email not available in public profile
      password: '', 
      role: user.role
    });
    setEditingId(user.id);
    setIsAdding(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir o perfil deste usuário?')) return;
    
    // Delete directly from Zustand store
    deleteUser(userId);
    alert('Usuário removido com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-500">Gerenciamento de usuários e permissões do sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'usuarios' ? 'bg-[#046393] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            Usuários
          </button>
          <button 
            onClick={() => setActiveTab('acessos')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'acessos' ? 'bg-[#046393] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            Acessos
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'usuarios' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-[#046393]" />
                Lista de Usuários
              </h2>
              <button 
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', username: '', password: '', role: 'Jovem aprendiz' });
                  setIsAdding(true);
                }}
                className="px-4 py-2 bg-[#046393] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-[#03527a] transition-all flex items-center gap-2"
              >
                <UserPlus size={18} />
                Novo Usuário
              </button>
            </div>

            {isAdding && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingId ? 'Editar Perfil do Usuário' : 'Novo Usuário'}
                  </h3>
                  {!editingId && (
                    <div className="px-3 py-1 bg-[#046393]/10 text-[#046393] text-[10px] font-bold rounded-full uppercase">
                      Informação
                    </div>
                  )}
                </div>

                {!editingId ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="text-[#046393] flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-bold text-[#046393]">Como cadastrar novos usuários?</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Para manter a segurança, novos usuários devem ser cadastrados diretamente no painel de controle do Supabase. 
                          Clique no botão abaixo para abrir o painel em uma nova aba.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setIsAdding(false)}
                        className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Cancelar
                      </button>
                      <a 
                        href="https://supabase.com/dashboard/project/pujqkyfjtaqhlcrgixcw/auth/users"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-[#046393] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-[#03527a] transition-all flex items-center gap-2"
                      >
                        Ir para o Supabase
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={18} />
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#046393]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Usuário (Login)</label>
                        <input
                          type="text"
                          required
                          value={formData.username}
                          onChange={e => setFormData({...formData, username: e.target.value})}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#046393]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Cargo</label>
                        <select
                          value={formData.role}
                          onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#046393]"
                        >
                          <option>Administrador</option>
                          <option>Supervisor</option>
                          <option>Jovem aprendiz</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button"
                          disabled={isLoading}
                          onClick={() => setIsAdding(false)}
                          className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          disabled={isLoading}
                          className="px-6 py-2 bg-[#046393] text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2"
                        >
                          {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase">Nome</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase">Usuário</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase">Cargo</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                              <UserIcon size={16} />
                            </div>
                            <span className="font-bold text-slate-700">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-500">{user.username}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            user.role === 'Administrador' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'Supervisor' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              disabled={user.id === currentUser.id || isLoading}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Shield className="text-[#046393]" />
                Controle de Acessos por Cargo
              </h2>
              
              <div className="space-y-8">
                {[
                  { role: 'Administrador', access: ['Tudo', 'Configurações', 'Romaneios', 'Atividades'] },
                  { role: 'Supervisor', access: ['Romaneios', 'Atividades', 'Verificação de Romaneios'] },
                  { role: 'Jovem aprendiz', access: ['Cadastrar Romaneios', 'Ver Atividades', 'Concluir Atividades'] },
                ].map((item) => (
                  <div key={item.role} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 text-lg">{item.role}</h3>
                      <span className="text-xs font-bold text-slate-400 uppercase">Permissões Ativas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.access.map((acc) => (
                        <span key={acc} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                          <Check size={14} className="text-emerald-500" />
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-amber-800">Nota sobre permissões</p>
                  <p className="text-xs text-amber-700">As permissões de acesso são baseadas no cargo do usuário e não podem ser alteradas individualmente nesta versão do sistema.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

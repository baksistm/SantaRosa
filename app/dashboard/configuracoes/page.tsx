'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
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
  Clock,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function ConfiguracoesPage() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'cadastros' | 'acessos'>('usuarios');
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Jovem aprendiz' as UserRole
  });

  const fetchData = useCallback(async () => {
    try {
      const [profilesData, requestsData] = await Promise.all([
        supabaseService.getProfiles(),
        supabaseService.getRegistrationRequests()
      ]);
      setUsers(profilesData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Error fetching settings data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (currentUser?.role?.trim() !== 'Administrador') {
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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (editingId) {
        await supabaseService.updateProfile(editingId, formData);
      } else {
        await supabaseService.createProfile(formData);
      }
      
      await fetchData();
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', username: '', password: '', role: 'Jovem aprendiz' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (request: any) => {
    setIsLoading(true);
    try {
      // 1. Create profile
      await supabaseService.createProfile({
        name: request.name,
        username: request.username,
        password: request.password,
        role: 'Jovem aprendiz' // Default role for new signups
      });
      // 2. Delete request
      await supabaseService.deleteRegistrationRequest(request.id);
      await fetchData();
      alert('Usuário aprovado e cadastrado com sucesso!');
    } catch (err: any) {
      alert('Erro ao aprovar: ' + err.message);
    } finally {
      setIsLoading(true); // Keep it true for a moment to show feedback if needed, then false
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    setIsLoading(true);
    try {
      await supabaseService.deleteRegistrationRequest(id);
      await fetchData();
    } catch (err: any) {
      alert('Erro ao excluir solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert('Você não pode excluir seu próprio perfil.');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este usuário permanentemente?')) return;
    try {
      await supabaseService.deleteProfile(id);
      await fetchData();
    } catch (err: any) {
      alert('Erro ao excluir usuário');
    }
  };

  const handleEditUser = (user: any) => {
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password || '',
      role: user.role
    });
    setEditingId(user.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-500">Gerenciamento de usuários e solicitações.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {(['usuarios', 'cadastros', 'acessos'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all capitalize ${
                activeTab === tab 
                  ? 'bg-[#046393] text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab === 'cadastros' && requests.length > 0 && (
                <span className="mr-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {requests.length}
                </span>
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'usuarios' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
                className="px-4 py-2 bg-[#046393] text-white font-bold rounded-xl shadow-lg hover:bg-[#03527a] transition-all flex items-center gap-2"
              >
                <UserPlus size={18} />
                Novo Usuário
              </button>
            </div>

            {isAdding && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
                <form onSubmit={handleSaveUser} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    {editingId ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
                  </h3>
                  {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#046393]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Usuário</label>
                      <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#046393]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Senha</label>
                      <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#046393]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Cargo</label>
                      <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#046393]">
                        <option>Administrador</option>
                        <option>Supervisor</option>
                        <option>Jovem aprendiz</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-[#046393] text-white font-bold rounded-lg shadow-lg flex items-center gap-2">
                      {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {editingId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
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
                      <td className="p-4 font-bold text-slate-700">{user.name}</td>
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
                          <button onClick={() => handleEditUser(user)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'cadastros' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="text-[#046393]" />
              Solicitações de Cadastro
            </h2>
            
            {requests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Clock size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Nenhuma solicitação</h3>
                <p className="text-slate-400">Novas solicitações de cadastro aparecerão aqui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((req) => (
                  <motion.div key={req.id} layout className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#046393]">
                        <UserIcon size={24} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveRequest(req)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"><CheckCircle size={20} /></button>
                        <button onClick={() => handleDeleteRequest(req.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"><X size={20} /></button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{req.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">Usuário solicitado: <span className="font-mono font-bold text-[#046393]">{req.username}</span></p>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendente</span>
                      <span className="text-[10px] text-slate-400 italic">Solicitado em {new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'acessos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Shield className="text-[#046393]" />
              Níveis de Acesso
            </h2>
            <div className="space-y-6">
              {[
                { role: 'Administrador', desc: 'Acesso total ao sistema, gestão de usuários e configurações.' },
                { role: 'Supervisor', desc: 'Gestão de romaneios e atividades, sem acesso a configurações.' },
                { role: 'Jovem aprendiz', desc: 'Lançamento de romaneios e execução de atividades.' },
              ].map((item) => (
                <div key={item.role} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-1">{item.role}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

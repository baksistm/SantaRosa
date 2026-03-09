'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabase-service';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  CheckSquare, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Link as LinkIcon, 
  FileText,
  Calendar,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AtividadesPage() {
  const { currentUser, atividades, setAtividades, users, setUsers } = useAppStore();
  const [activeTab, setActiveTab] = useState<'lista' | 'novo'>('lista');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch activities on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const atividadesData = await supabaseService.getAtividades();
        setAtividades(atividadesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Subscribe to changes
    const channel = supabase
      .channel('atividades_changes')
      .on('postgres_changes' as any, { event: '*', table: 'atividades' }, () => {
        supabaseService.getAtividades().then(setAtividades);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setAtividades]);

  // Filter Jovens for assignment
  const jovens = useMemo(() => {
    return users.filter(u => u.role === 'Jovem aprendiz');
  }, [users]);

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    link: '',
    periodo: 'Sem período' as any,
    assigned_to: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const payload = {
        ...formData,
        assigned_to: formData.assigned_to || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('atividades')
          .update(payload)
          .eq('id', editingId);
        
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('atividades')
          .insert([{
            ...payload,
            concluida: false
          }]);
        
        if (error) throw error;
      }

      setFormData({ titulo: '', descricao: '', link: '', periodo: 'Sem período', assigned_to: '' });
      setActiveTab('lista');

      // Manual fetch as a fallback for realtime
      const data = await supabaseService.getAtividades();
      setAtividades(data);
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Erro ao salvar atividade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (atividade: any) => {
    setFormData({
      titulo: atividade.titulo,
      descricao: atividade.descricao,
      link: atividade.link || '',
      periodo: atividade.periodo,
      assigned_to: atividade.assigned_to || ''
    });
    setEditingId(atividade.id);
    setActiveTab('novo');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;
    
    try {
      const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Erro ao excluir atividade');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('atividades')
        .update({ concluida: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const userRole = currentUser?.role?.trim();
  const canManage = userRole === 'Administrador' || userRole === 'Supervisor';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Atividades</h1>
          <p className="text-slate-500">Gestão de tarefas e prazos para menores aprendizes.</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('lista')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'lista' ? 'bg-[#046393] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              Ver Atividades
            </button>
            <button 
              onClick={() => {
                setEditingId(null);
                setFormData({ titulo: '', descricao: '', link: '', periodo: 'Sem período' });
                setActiveTab('novo');
              }}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'novo' ? 'bg-[#046393] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Plus size={18} />
              Nova Atividade
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'novo' && canManage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CheckSquare className="text-[#046393]" />
                {editingId ? 'Editar Atividade' : 'Cadastrar Nova Atividade'}
              </h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Título da Atividade</label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={e => setFormData({...formData, titulo: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                      placeholder="Ex: Organização de arquivos"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Responsável (Jovem Aprendiz)</label>
                    <select
                      value={formData.assigned_to}
                      onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                    >
                      <option value="">Selecione um jovem...</option>
                      {jovens.map(jovem => (
                        <option key={jovem.id} value={jovem.id}>{jovem.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Período para Entrega</label>
                    <select
                      value={formData.periodo}
                      onChange={e => setFormData({...formData, periodo: e.target.value as any})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                    >
                      <option>Até o final do dia</option>
                      <option>Até o fim da semana</option>
                      <option>Até amanhã no fim do dia</option>
                      <option>Sem período</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Descrição</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none resize-none"
                    placeholder="Descreva detalhadamente o que deve ser feito..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Link de Referência (Opcional)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="url"
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('lista')}
                    className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#046393] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-[#03527a] transition-all"
                  >
                    {editingId ? 'Salvar Alterações' : 'Criar Atividade'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {atividades.filter(atv => currentUser?.role !== 'Jovem aprendiz' || atv.assigned_to === currentUser.id).length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <CheckSquare size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Nenhuma atividade</h3>
                <p className="text-slate-400">As atividades cadastradas aparecerão aqui.</p>
              </div>
            ) : (
              atividades
                .filter(atv => currentUser?.role !== 'Jovem aprendiz' || atv.assigned_to === currentUser.id)
                .map((atv) => (
                  <motion.div
                    layout
                    key={atv.id}
                    className={`bg-white rounded-3xl border p-6 shadow-sm transition-all flex flex-col ${atv.concluida ? 'border-emerald-100 opacity-75' : 'border-slate-100'}`}
                  >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${atv.concluida ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-[#046393]'}`}>
                      <CheckSquare size={24} />
                    </div>
                    <div className="flex items-center gap-1">
                      {canManage && (
                        <>
                          <button 
                            onClick={() => handleEdit(atv)}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(atv.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className={`text-lg font-bold mb-2 ${atv.concluida ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {atv.titulo}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">
                    {atv.descricao}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Clock size={14} />
                        {atv.periodo}
                      </div>
                      {atv.assigned_to && (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#046393] uppercase tracking-wider">
                          <UserIcon size={14} />
                          {users.find(u => u.id === atv.assigned_to)?.username || 'Usuário não encontrado'}
                        </div>
                      )}
                    </div>
                    {atv.link && (
                      <a 
                        href={atv.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-[#046393] hover:underline"
                      >
                        <LinkIcon size={14} />
                        Link de Referência
                      </a>
                    )}
                    
                    <button
                      onClick={() => toggleStatus(atv.id, atv.concluida)}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        atv.concluida 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      {atv.concluida ? (
                        <>
                          <CheckCircle size={18} />
                          Concluída
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 border-2 border-current rounded-sm" />
                          Marcar como Concluída
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

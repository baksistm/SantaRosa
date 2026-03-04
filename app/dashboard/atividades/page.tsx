'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AtividadesPage() {
  const { currentUser, atividades, addAtividade, updateAtividade, deleteAtividade } = useAppStore();
  const [activeTab, setActiveTab] = useState<'lista' | 'novo'>('lista');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    link: '',
    periodo: 'Sem período' as any
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateAtividade(editingId, formData);
      setEditingId(null);
    } else {
      addAtividade({
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        concluida: false,
        createdAt: new Date().toISOString()
      });
    }

    setFormData({ titulo: '', descricao: '', link: '', periodo: 'Sem período' });
    setActiveTab('lista');
  };

  const handleEdit = (atividade: any) => {
    setFormData({
      titulo: atividade.titulo,
      descricao: atividade.descricao,
      link: atividade.link || '',
      periodo: atividade.periodo
    });
    setEditingId(atividade.id);
    setActiveTab('novo');
  };

  const toggleStatus = (id: string, currentStatus: boolean) => {
    updateAtividade(id, { concluida: !currentStatus });
  };

  const canManage = currentUser?.role === 'Administrador' || currentUser?.role === 'Supervisor';

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {atividades.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <CheckSquare size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Nenhuma atividade</h3>
                <p className="text-slate-400">As atividades cadastradas aparecerão aqui.</p>
              </div>
            ) : (
              atividades.map((atv) => (
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
                            onClick={() => deleteAtividade(atv.id)}
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
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Clock size={14} />
                      {atv.periodo}
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

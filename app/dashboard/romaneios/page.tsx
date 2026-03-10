'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabase-service';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Printer,
  Download,
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RomaneiosPage() {
  const { currentUser, romaneios, setRomaneios } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lista' | 'novo' | 'verificacao'>(
    (searchParams.get('action') === 'new' ? 'novo' : 'lista') as 'lista' | 'novo' | 'verificacao'
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch romaneios on mount
  useEffect(() => {
    const fetchRomaneios = async () => {
      try {
        const data = await supabaseService.getRomaneios();
        setRomaneios(data);
      } catch (error) {
        console.error('Error fetching romaneios:', error);
      }
    };

    fetchRomaneios();

    // Subscribe to changes
    const channel = supabase
      .channel('romaneios_changes')
      .on('postgres_changes' as any, { event: '*', table: 'romaneios' }, () => {
        fetchRomaneios();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setRomaneios]);

  // Form State
  const [formData, setFormData] = useState({
    cliente: '',
    clienteFilial: '',
    nf: '',
    entrada: 0,
    saldo: 0,
    numeroRomaneio: ''
  });

  const umPorCento = useMemo(() => formData.entrada * 0.01, [formData.entrada]);

  const filteredRomaneios = useMemo(() => {
    let list = romaneios;
    
    // Filter by search
    if (searchTerm) {
      list = list.filter(r => 
        r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nf.includes(searchTerm) ||
        r.numeroRomaneio?.includes(searchTerm)
      );
    }

    // Role based filtering for "Cadastrados"
    if (activeTab === 'lista') {
      return list.filter(r => r.status === 'Cadastrado' || r.status === 'Aprovado');
    }
    
    // Verification tab
    if (activeTab === 'verificacao') {
      return list.filter(r => r.status === 'Pendente');
    }

    return list;
  }, [romaneios, searchTerm, activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('romaneios')
          .update({
            cliente: formData.cliente,
            cliente_filial: formData.clienteFilial,
            nf: formData.nf,
            entrada: formData.entrada,
            saldo: formData.saldo,
            numero_romaneio: formData.numeroRomaneio
          })
          .eq('id', editingId);
        
        if (error) throw error;
        setEditingId(null);
      } else {
        const status = formData.saldo < umPorCento ? 'Cadastrado' : 'Pendente';
        
        const { error } = await supabase
          .from('romaneios')
          .insert([{
            cliente: formData.cliente,
            cliente_filial: formData.clienteFilial,
            nf: formData.nf,
            entrada: formData.entrada,
            saldo: formData.saldo,
            numero_romaneio: formData.numeroRomaneio,
            status,
            created_by: currentUser?.id
          }]);
        
        if (error) throw error;
      }

      setFormData({ cliente: '', clienteFilial: '', nf: '', entrada: 0, saldo: 0, numeroRomaneio: '' });
      setActiveTab('lista');
      
      // Manual fetch as a fallback for realtime
      const data = await supabaseService.getRomaneios();
      setRomaneios(data);
    } catch (error) {
      console.error('Error saving romaneio:', error);
      alert('Erro ao salvar romaneio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (romaneio: any) => {
    setFormData({
      cliente: romaneio.cliente,
      clienteFilial: romaneio.cliente_filial || romaneio.clienteFilial,
      nf: romaneio.nf,
      entrada: romaneio.entrada,
      saldo: romaneio.saldo,
      numeroRomaneio: romaneio.numero_romaneio || romaneio.numeroRomaneio || ''
    });
    setEditingId(romaneio.id);
    setActiveTab('novo');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este romaneio?')) return;
    
    try {
      const { error } = await supabase
        .from('romaneios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting romaneio:', error);
      alert('Erro ao excluir romaneio');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('romaneios')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(4, 99, 147);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Santa Rosa Malhas | Filial 3', 15, 20);
    doc.setFontSize(10);
    doc.text('CNPJ: 81.326.084/0003-11', 15, 30);
    
    // User Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    const now = new Date();
    doc.text(`Gerado por: ${currentUser?.name}`, 150, 50);
    doc.text(`Data: ${format(now, 'dd/MM/yyyy HH:mm')}`, 150, 55);
    
    // Table
    const tableData = filteredRomaneios.map(r => [
      r.numeroRomaneio || '-',
      r.cliente,
      r.clienteFilial || '-',
      r.nf,
      `R$ ${r.entrada.toFixed(2)}`,
      `R$ ${r.saldo.toFixed(2)}`,
      r.status
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Nº Romaneio', 'Cliente', 'Filial', 'NF', 'Entrada', 'Saldo', 'Status']],
      body: tableData,
      headStyles: { fillColor: [4, 99, 147] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`romaneios_${format(now, 'yyyyMMdd_HHmm')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Romaneios</h1>
          <p className="text-slate-500">Gerenciamento de entradas e conferências.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('lista')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'lista' ? 'bg-[#046393] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            Cadastrados
          </button>
          {(currentUser?.role?.trim() === 'Administrador' || currentUser?.role?.trim() === 'Supervisor') && (
            <button 
              onClick={() => setActiveTab('verificacao')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'verificacao' ? 'bg-[#046393] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              Verificação
            </button>
          )}
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ cliente: '', clienteFilial: '', nf: '', entrada: 0, saldo: 0, numeroRomaneio: '' });
              setActiveTab('novo');
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'novo' ? 'bg-[#046393] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Plus size={18} />
            Novo Romaneio
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'novo' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="text-[#046393]" />
                {editingId ? 'Editar Romaneio' : 'Novo Romaneio de Fio'}
              </h2>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Cliente</label>
                  <input
                    type="text"
                    required
                    value={formData.cliente}
                    onChange={e => setFormData({...formData, cliente: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Cliente Filial</label>
                  <input
                    type="text"
                    required
                    value={formData.clienteFilial}
                    onChange={e => setFormData({...formData, clienteFilial: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                    placeholder="Filial do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">NF</label>
                  <input
                    type="text"
                    required
                    value={formData.nf}
                    onChange={e => setFormData({...formData, nf: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                    placeholder="Número da Nota Fiscal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Entrada (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.entrada || ''}
                    onChange={e => setFormData({...formData, entrada: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                    placeholder="0,00"
                  />
                  {formData.entrada > 0 && (
                    <p className="text-xs font-bold text-[#046393] bg-blue-50 p-2 rounded-lg inline-block">
                      1% da Entrada: R$ {umPorCento.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Saldo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.saldo || ''}
                    onChange={e => setFormData({...formData, saldo: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                    placeholder="0,00"
                  />
                </div>
                {editingId && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nº Romaneio</label>
                    <input
                      type="number"
                      value={formData.numeroRomaneio}
                      onChange={e => setFormData({...formData, numeroRomaneio: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#046393] outline-none"
                      placeholder="Somente números"
                    />
                  </div>
                )}
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
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
                    {editingId ? 'Salvar Alterações' : 'Cadastrar Romaneio'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por cliente, NF ou romaneio..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#046393] outline-none shadow-sm"
                />
              </div>
              <button 
                onClick={generatePDF}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Printer size={20} />
                Imprimir PDF
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nº Romaneio</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Filial</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">NF</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Entrada</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRomaneios.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <FileText size={32} />
                          </div>
                          <p className="text-slate-400 font-medium">Nenhum romaneio encontrado</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRomaneios.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4 font-mono text-sm font-bold text-[#046393]">{r.numeroRomaneio || '-'}</td>
                          <td className="p-4">
                            <p className="text-sm font-bold text-slate-700">{r.cliente}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{r.clienteFilial || '-'}</p>
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-600">{r.nf}</td>
                          <td className="p-4 text-sm font-bold text-slate-700">R$ {r.entrada.toFixed(2)}</td>
                          <td className="p-4 text-sm font-bold text-slate-700">R$ {r.saldo.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${
                              r.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' :
                              r.status === 'Recusado' ? 'bg-red-100 text-red-700' :
                              r.status === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {r.status === 'Aprovado' && <CheckCircle size={12} />}
                              {r.status === 'Recusado' && <XCircle size={12} />}
                              {r.status === 'Pendente' && <AlertCircle size={12} />}
                              {r.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {activeTab === 'verificacao' ? (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(r.id, 'Aprovado')}
                                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Aprovar"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(r.id, 'Recusado')}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Recusar"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleEdit(r)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(r.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

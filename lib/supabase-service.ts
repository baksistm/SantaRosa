import { supabase } from './supabase';
import { User, Romaneio, Atividade } from './types';

export const supabaseService = {
  // Perfis / Usuários
  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data || []).map((p: any) => ({
      ...p,
      role: p.function
    }));
  },

  // Romaneios
  async getRomaneios() {
    const { data, error } = await supabase
      .from('romaneios')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((r: any) => ({
      ...r,
      clienteFilial: r.cliente_filial,
      numeroRomaneio: r.numero_romaneio,
      createdAt: r.created_at,
      createdBy: r.created_by
    }));
  },

  async createRomaneio(romaneio: any) {
    try {
      const payload = {
        cliente: romaneio.cliente ? String(romaneio.cliente) : '',
        cliente_filial: romaneio.cliente_filial ? String(romaneio.cliente_filial) : null,
        nf: romaneio.nf ? String(romaneio.nf) : '',
        entrada: Number(romaneio.entrada) || 0,
        saldo: Number(romaneio.saldo) || 0,
        numero_romaneio: romaneio.numero_romaneio ? String(romaneio.numero_romaneio) : null,
        status: romaneio.status ? String(romaneio.status) : 'Pendente',
        created_by: romaneio.created_by
      };

      const { data, error } = await supabase
        .from('romaneios')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error details:', error);
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Supabase createRomaneio caught error:', error);
      throw error;
    }
  },

  async updateRomaneio(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('romaneios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase update romaneio error details:', error);
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Supabase updateRomaneio caught error:', error);
      throw error;
    }
  },

  async deleteRomaneio(id: string) {
    try {
      const { error } = await supabase
        .from('romaneios')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase delete romaneio error details:', error);
        throw error;
      }
      return true;
    } catch (error: any) {
      console.error('Supabase deleteRomaneio caught error:', error);
      throw error;
    }
  },

  async updateRomaneioStatus(id: string, status: string) {
    const { error } = await supabase
      .from('romaneios')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Atividades
  async getAtividades() {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((a: any) => ({
      ...a,
      createdAt: a.created_at
    }));
  },

  async createAtividade(atividade: any) {
    try {
      const payload = {
        titulo: atividade.titulo ? String(atividade.titulo) : '',
        descricao: atividade.descricao ? String(atividade.descricao) : '',
        link: atividade.link ? String(atividade.link) : null,
        periodo: atividade.periodo ? String(atividade.periodo) : 'Sem período',
        concluida: Boolean(atividade.concluida),
        assigned_to: atividade.assigned_to || null,
        created_by: atividade.created_by
      };

      const { data, error } = await supabase
        .from('atividades')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert atividade error details:', error);
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Supabase createAtividade caught error:', error);
      throw error;
    }
  },

  async updateAtividade(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('atividades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase update atividade error details:', error);
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Supabase updateAtividade caught error:', error);
      throw error;
    }
  },

  async deleteAtividade(id: string) {
    try {
      const { error } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase delete atividade error details:', error);
        throw error;
      }
      return true;
    } catch (error: any) {
      console.error('Supabase deleteAtividade caught error:', error);
      throw error;
    }
  },

  async toggleAtividade(id: string, concluida: boolean) {
    const { data, error } = await supabase
      .from('atividades')
      .update({ concluida })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

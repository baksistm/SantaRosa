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

  async createProfile(profile: any) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: crypto.randomUUID(),
        name: profile.name,
        username: profile.username,
        password: profile.password,
        function: profile.role || profile.function
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(id: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        username: updates.username,
        password: updates.password,
        function: updates.role || updates.function
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProfile(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Solicitações de Cadastro
  async getRegistrationRequests() {
    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createRegistrationRequest(request: any) {
    const { data, error } = await supabase
      .from('registration_requests')
      .insert([request])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRegistrationRequest(id: string) {
    const { error } = await supabase
      .from('registration_requests')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
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
      const payload: any = {
        cliente: String(romaneio.cliente || ''),
        cliente_filial: romaneio.cliente_filial ? String(romaneio.cliente_filial) : null,
        nf: String(romaneio.nf || ''),
        entrada: Number(romaneio.entrada) || 0,
        saldo: Number(romaneio.saldo) || 0,
        numero_romaneio: romaneio.numero_romaneio ? String(romaneio.numero_romaneio) : null,
        status: String(romaneio.status || 'Pendente'),
        created_by: (romaneio.created_by && romaneio.created_by !== '') ? romaneio.created_by : null
      };

      const { data, error } = await supabase
        .from('romaneios')
        .insert([payload])
        .select();
      
      if (error) throw error;
      return data ? data[0] : null;
    } catch (error: any) {
      console.error('Erro detalhado ao criar romaneio:', error);
      throw error;
    }
  },

  async updateRomaneio(id: string, updates: any) {
    try {
      const payload: any = {};
      if (updates.cliente !== undefined) payload.cliente = String(updates.cliente);
      if (updates.cliente_filial !== undefined) payload.cliente_filial = updates.cliente_filial ? String(updates.cliente_filial) : null;
      if (updates.nf !== undefined) payload.nf = String(updates.nf);
      if (updates.entrada !== undefined) payload.entrada = Number(updates.entrada);
      if (updates.saldo !== undefined) payload.saldo = Number(updates.saldo);
      if (updates.numero_romaneio !== undefined) payload.numero_romaneio = updates.numero_romaneio ? String(updates.numero_romaneio) : null;
      if (updates.status !== undefined) payload.status = String(updates.status);

      const { data, error } = await supabase
        .from('romaneios')
        .update(payload)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data ? data[0] : null;
    } catch (error: any) {
      console.error('Erro detalhado ao atualizar romaneio:', error);
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
      .select(`
        *,
        assigned_user:profiles!assigned_to(id, name, username)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((a: any) => {
      // Garantir que assignedUser seja um objeto único, não um array
      let assignedUser = null;
      if (a.assigned_user) {
        assignedUser = Array.isArray(a.assigned_user) ? a.assigned_user[0] : a.assigned_user;
      }

      return {
        ...a,
        createdAt: a.created_at,
        assignedUser: assignedUser
      };
    });
  },

  async createAtividade(atividade: any) {
    try {
      const payload: any = {
        titulo: String(atividade.titulo || ''),
        descricao: String(atividade.descricao || ''),
        link: atividade.link ? String(atividade.link) : null,
        periodo: String(atividade.periodo || 'Sem período'),
        concluida: Boolean(atividade.concluida),
        assigned_to: (atividade.assigned_to && atividade.assigned_to !== '') ? atividade.assigned_to : null,
        created_by: (atividade.created_by && atividade.created_by !== '') ? atividade.created_by : null
      };

      const { data, error } = await supabase
        .from('atividades')
        .insert([payload])
        .select();
      
      if (error) throw error;
      return data ? data[0] : null;
    } catch (error: any) {
      console.error('Erro detalhado ao criar atividade:', error);
      throw error;
    }
  },

  async updateAtividade(id: string, updates: any) {
    try {
      const payload: any = {
        titulo: String(updates.titulo || ''),
        descricao: String(updates.descricao || ''),
        link: updates.link ? String(updates.link) : null,
        periodo: String(updates.periodo || 'Sem período'),
        assigned_to: (updates.assigned_to && updates.assigned_to !== '') ? updates.assigned_to : null
      };

      const { data, error } = await supabase
        .from('atividades')
        .update(payload)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data ? data[0] : null;
    } catch (error: any) {
      console.error('Erro detalhado ao atualizar atividade:', error);
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

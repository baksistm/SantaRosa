import { supabase } from './supabase';
import { User, Romaneio, Atividade } from './types';

export const supabaseService = {
  // Profiles
  async getProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Romaneios
  async getRomaneios() {
    const { data, error } = await supabase
      .from('romaneios')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createRomaneio(romaneio: Omit<Romaneio, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('romaneios')
      .insert([romaneio])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Atividades
  async getAtividades() {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
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

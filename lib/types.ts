import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Administrador' | 'Supervisor' | 'Jovem aprendiz';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface Romaneio {
  id: string;
  cliente: string;
  clienteFilial: string;
  nf: string;
  entrada: number;
  saldo: number;
  numeroRomaneio?: string;
  status: 'Cadastrado' | 'Pendente' | 'Aprovado' | 'Recusado';
  createdAt: string;
  createdBy: string;
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  link?: string;
  periodo: 'Até o final do dia' | 'Até o fim da semana' | 'Até amanhã no fim do dia' | 'Sem período';
  concluida: boolean;
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  romaneios: Romaneio[];
  atividades: Atividade[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addRomaneio: (romaneio: Omit<Romaneio, 'id' | 'createdAt' | 'status'>) => void;
  updateRomaneio: (id: string, data: Partial<Romaneio>) => void;
  deleteRomaneio: (id: string) => void;
  addAtividade: (atividade: Omit<Atividade, 'id' | 'createdAt' | 'concluida'>) => void;
  updateAtividade: (id: string, data: Partial<Atividade>) => void;
  deleteAtividade: (id: string) => void;
  toggleAtividade: (id: string) => void;
}

// Mock initial users
const initialUsers: User[] = [
  { id: '1', username: 'admin', name: 'Admin Santa Rosa', role: 'Administrador', password: '123' },
  { id: '2', username: 'supervisor', name: 'Supervisor João', role: 'Supervisor', password: '123' },
  { id: '3', username: 'jovem', name: 'Aprendiz Maria', role: 'Jovem aprendiz', password: '123' },
];

// We'll use a simple vanilla state for now since zustand isn't installed and I want to keep it simple with React Context or just a custom hook if needed.
// Actually, I'll just use a simple local storage based store.

export const useStore = () => {
  // This is a simplified version of a store for the demo
  // In a real app, we'd use a proper state management library
  return {};
};

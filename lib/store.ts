import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Romaneio, Atividade, UserRole } from './types';

interface AppState {
  currentUser: User | null;
  users: User[];
  romaneios: Romaneio[];
  atividades: Atividade[];
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  setUsers: (users: User[]) => void;
  setRomaneios: (romaneios: Romaneio[]) => void;
  setAtividades: (atividades: Atividade[]) => void;
  
  // Actions
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addRomaneio: (romaneio: Romaneio) => void;
  updateRomaneio: (id: string, data: Partial<Romaneio>) => void;
  deleteRomaneio: (id: string) => void;
  addAtividade: (atividade: Atividade) => void;
  updateAtividade: (id: string, data: Partial<Atividade>) => void;
  deleteAtividade: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      users: [
        { id: '1', username: 'admin', name: 'Administrador', role: 'Administrador', password: '123' },
        { id: '2', username: 'supervisor', name: 'Supervisor', role: 'Supervisor', password: '123' },
        { id: '3', username: 'jovem', name: 'Jovem Aprendiz', role: 'Jovem aprendiz', password: '123' },
        { id: '4', username: 'Bruno', name: 'Bruno', role: 'Administrador', password: 'BAK' },
      ],
      romaneios: [],
      atividades: [],
      
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      setUsers: (users) => set({ users }),
      setRomaneios: (romaneios) => set({ romaneios }),
      setAtividades: (atividades) => set({ atividades }),

      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (user) => set((state) => ({
        users: state.users.map((u) => (u.id === user.id ? user : u)),
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      })),

      addRomaneio: (romaneio) => set((state) => ({ romaneios: [...state.romaneios, romaneio] })),
      updateRomaneio: (id, data) => set((state) => ({
        romaneios: state.romaneios.map((r) => (r.id === id ? { ...r, ...data } : r)),
      })),
      deleteRomaneio: (id) => set((state) => ({
        romaneios: state.romaneios.filter((r) => r.id !== id),
      })),

      addAtividade: (atividade) => set((state) => ({ atividades: [...state.atividades, atividade] })),
      updateAtividade: (id, data) => set((state) => ({
        atividades: state.atividades.map((a) => (a.id === id ? { ...a, ...data } : a)),
      })),
      deleteAtividade: (id) => set((state) => ({
        atividades: state.atividades.filter((a) => a.id !== id),
      })),
    }),
    {
      name: 'santa-rosa-storage',
    }
  )
);

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

export type AtividadePeriodo = 'Até o final do dia' | 'Até o fim da semana' | 'Até amanhã no fim do dia' | 'Sem período';

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  link?: string;
  periodo: AtividadePeriodo;
  concluida: boolean;
  assigned_to?: string; // ID do usuário (Jovem aprendiz)
  createdAt: string;
}

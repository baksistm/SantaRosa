'use client';

import { useAppStore } from '@/lib/store';
import { motion } from 'motion/react';
import { 
  FileText, 
  CheckSquare, 
  Settings, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Clock as ClockIcon,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Clock } from '@/components/Clock';

export default function DashboardPage() {
  const { currentUser, romaneios, atividades } = useAppStore();

  if (!currentUser) return null;

  const stats = [
    { 
      label: 'Romaneios', 
      value: romaneios.length, 
      icon: FileText, 
      color: 'bg-blue-500',
      show: true
    },
    { 
      label: 'Atividades Pendentes', 
      value: atividades.filter(a => !a.concluida).length, 
      icon: CheckSquare, 
      color: 'bg-amber-500',
      show: currentUser.role !== 'Supervisor'
    },
    { 
      label: 'Aguardando Verificação', 
      value: romaneios.filter(r => r.status === 'Pendente').length, 
      icon: AlertCircle, 
      color: 'bg-red-500',
      show: currentUser.role !== 'Jovem aprendiz'
    },
  ].filter(s => s.show);

  const quickActions = [
    { 
      title: 'Novo Romaneio', 
      desc: 'Cadastrar entrada de fio', 
      href: '/dashboard/romaneios?action=new', 
      icon: FileText,
      roles: ['Administrador', 'Supervisor', 'Jovem aprendiz']
    },
    { 
      title: 'Ver Atividades', 
      desc: 'Gerenciar tarefas diárias', 
      href: '/dashboard/atividades', 
      icon: CheckSquare,
      roles: ['Administrador', 'Supervisor', 'Jovem aprendiz']
    },
    { 
      title: 'Configurações', 
      desc: 'Gerenciar usuários e acessos', 
      href: '/dashboard/configuracoes', 
      icon: Settings,
      roles: ['Administrador']
    },
  ].filter(action => action.roles.includes(currentUser.role));

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Olá, {currentUser.name}!</h1>
          <p className="text-slate-500">Bem-vindo ao painel de controle da Filial 3.</p>
        </div>
        <Clock />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#046393]" />
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link 
                key={action.title} 
                href={action.href}
                className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#046393]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#046393] group-hover:bg-[#046393] group-hover:text-white transition-colors">
                    <action.icon size={24} />
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-[#046393] transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{action.title}</h3>
                <p className="text-sm text-slate-500">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities / Tasks */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare size={20} className="text-[#046393]" />
            Atividades
          </h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 space-y-4">
              {atividades.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <CheckSquare size={32} />
                  </div>
                  <p className="text-slate-400 font-medium">Nenhuma atividade cadastrada</p>
                </div>
              ) : (
                atividades.slice(0, 5).map((atv) => (
                  <div key={atv.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${atv.concluida ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${atv.concluida ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {atv.titulo}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{atv.periodo}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link 
              href="/dashboard/atividades"
              className="block w-full p-4 bg-slate-50 text-center text-sm font-bold text-[#046393] hover:bg-slate-100 transition-colors"
            >
              Ver todas as atividades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

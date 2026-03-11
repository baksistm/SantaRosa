# Santa Rosa Malhas - Filial 3
## Sistema de Gestão Interna

Sistema web desenvolvido para a gestão de romaneios, atividades e controle de acesso da Filial 3 da Santa Rosa Malhas.

### 🚀 Funcionalidades Principais

#### 📦 Gestão de Romaneios
- **Lançamento:** Cadastro detalhado de entradas com cliente, filial, NF, valores e saldos.
- **Cálculo Automático:** Sistema calcula automaticamente a tolerância de 1% para conferência.
- **Verificação:** Fluxo de aprovação/recusa de romaneios com status visual.
- **Relatórios PDF:** Geração de documentos PDF com filtros por período e por usuário que realizou o cadastro.

#### 📝 Gestão de Atividades
- **Controle de Tarefas:** Criação de atividades com descrição, prazos e links de referência.
- **Atribuição:** Possibilidade de atribuir tarefas a usuários específicos (ex: Jovens Aprendizes).
- **Exportação:** Geração de PDF de atividades pendentes com design profissional e logo da empresa.

#### 🔐 Controle de Acesso e Configurações
- **Níveis de Permissão:**
  - **Administrador:** Acesso total, gestão de usuários e configurações do sistema.
  - **Supervisor:** Gestão de romaneios e atividades.
  - **Jovem Aprendiz:** Lançamento de romaneios e execução de tarefas atribuídas.
- **Solicitações de Cadastro:** Sistema de aprovação de novos usuários pelo administrador.
- **Gestão de Perfil:** Edição e exclusão de usuários diretamente pelo painel administrativo.

### 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js 15+, React, Tailwind CSS.
- **Animações:** Motion (Framer Motion).
- **Banco de Dados & Autenticação:** Supabase.
- **Relatórios:** jsPDF e jsPDF-AutoTable.
- **Ícones:** Lucide React.

### 📋 Requisitos de Instalação

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env` (baseado no `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 🏗️ Estrutura do Projeto

- `/app`: Rotas e páginas do Next.js (App Router).
- `/components`: Componentes React reutilizáveis.
- `/lib`: Serviços, stores (Zustand) e definições de tipos.
- `/public`: Ativos estáticos como logos e imagens.
- `/supabase`: Scripts SQL para configuração do banco de dados.

---
Desenvolvido para otimizar os processos internos da **Santa Rosa Malhas**.

-- 
-- 1. SQL PARA LIMPAR TUDO (RESET TOTAL)
-- Execute este bloco primeiro para limpar o banco de dados
--

-- Primeiro removemos o gatilho que depende da função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Depois removemos as tabelas (isso remove as políticas que dependem das funções)
DROP TABLE IF EXISTS public.atividades;
DROP TABLE IF EXISTS public.romaneios;
DROP TABLE IF EXISTS public.profiles;

-- Por fim, removemos as funções com CASCADE para garantir que nada reste
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_supervisor() CASCADE;

--
-- 2. SQL PARA CRIAR TUDO DO ZERO (SCHEMA LIMPO)
-- Execute este bloco após a limpeza
--

-- Tabela de Perfis
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  name TEXT,
  function TEXT CHECK (function IN ('Administrador', 'Supervisor', 'Jovem aprendiz')) DEFAULT 'Jovem aprendiz',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Romaneios
CREATE TABLE public.romaneios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  cliente_filial TEXT NOT NULL,
  nf TEXT NOT NULL,
  entrada NUMERIC NOT NULL DEFAULT 0,
  saldo NUMERIC NOT NULL DEFAULT 0,
  numero_romaneio TEXT,
  status TEXT NOT NULL CHECK (status IN ('Cadastrado', 'Pendente', 'Aprovado', 'Recusado')) DEFAULT 'Cadastrado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Tabela de Atividades
CREATE TABLE public.atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  link TEXT,
  periodo TEXT NOT NULL CHECK (periodo IN ('Até o final do dia', 'Até o fim da semana', 'Até amanhã no fim do dia', 'Sem período')),
  concluida BOOLEAN DEFAULT FALSE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Funções de Segurança
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND function = 'Administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_supervisor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND function = 'Supervisor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho para Novos Usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username, function)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Jovem aprendiz')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.romaneios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (RLS)
CREATE POLICY "Perfis visíveis por todos autenticados" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários atualizam próprio perfil" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins gerenciam todos os perfis" ON profiles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Romaneios visíveis por todos autenticados" ON romaneios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Qualquer autenticado insere romaneio" ON romaneios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins e Supervisores editam romaneios" ON romaneios FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_supervisor());
CREATE POLICY "Apenas Admins deletam romaneios" ON romaneios FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Atividades visíveis por todos autenticados" ON atividades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins e Supervisores gerenciam atividades" ON atividades FOR ALL TO authenticated USING (public.is_admin() OR public.is_supervisor());
CREATE POLICY "Jovens atualizam status de suas atividades" ON atividades FOR UPDATE TO authenticated USING (auth.uid() = assigned_to);

-- Habilitar Realtime
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.romaneios REPLICA IDENTITY FULL;
ALTER TABLE public.atividades REPLICA IDENTITY FULL;

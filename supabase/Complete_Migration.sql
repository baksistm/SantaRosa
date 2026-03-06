-- 
-- MIGRATION COMPLETA E PLANEJADA - SANTA ROSA FILIAL 3
-- Este script configura todo o banco de dados do zero com suporte a cargos (function)
-- Execute este script no SQL Editor do Supabase
--

-- 1. LIMPEZA INICIAL (Opcional, use com cuidado se já houver dados)
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- drop function if exists public.is_admin();

-- 2. TABELA DE PERFIS (PROFILES)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  username text unique,
  name text,
  function text check (function in ('Administrador', 'Supervisor', 'Jovem aprendiz')) default 'Jovem aprendiz',
  created_at timestamp with time zone default now()
);

-- 3. TABELA DE ROMANEIOS
create table if not exists public.romaneios (
  id uuid default gen_random_uuid() primary key,
  cliente text not null,
  cliente_filial text not null,
  nf text not null,
  entrada numeric not null default 0,
  saldo numeric not null default 0,
  numero_romaneio text,
  status text not null check (status in ('Cadastrado', 'Pendente', 'Aprovado', 'Recusado')) default 'Cadastrado',
  created_at timestamp with time zone default now() not null,
  created_by uuid references public.profiles(id) on delete set null
);

-- 4. TABELA DE ATIVIDADES
create table if not exists public.atividades (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descricao text,
  link text,
  periodo text not null check (periodo in ('Até o final do dia', 'Até o fim da semana', 'Até amanhã no fim do dia', 'Sem período')),
  concluida boolean default false not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now() not null
);

-- 5. HABILITAR RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.romaneios enable row level security;
alter table public.atividades enable row level security;

-- 6. FUNÇÕES DE SUPORTE
-- Verifica se o usuário atual é Administrador
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and function = 'Administrador'
  );
end;
$$ language plpgsql security definer;

-- Verifica se o usuário atual é Supervisor
create or replace function public.is_supervisor()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and function = 'Supervisor'
  );
end;
$$ language plpgsql security definer;

-- 7. GATILHO PARA NOVOS USUÁRIOS (Cria perfil automático)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, username, function)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    case 
      when new.email = 'brunoalekohler@gmail.com' then 'Administrador'
      else coalesce(new.raw_user_meta_data->>'role', 'Jovem aprendiz')
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recriar o trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. POLÍTICAS DE SEGURANÇA (RLS)

-- Perfis
drop policy if exists "Leitura pública para autenticados" on profiles;
create policy "Leitura pública para autenticados" on profiles
  for select to authenticated using (true);

drop policy if exists "Atualizar próprio perfil" on profiles;
create policy "Atualizar próprio perfil" on profiles
  for update to authenticated using (auth.uid() = id);

drop policy if exists "Admin gerencia perfis" on profiles;
create policy "Admin gerencia perfis" on profiles
  for all to authenticated using (public.is_admin());

-- Romaneios
drop policy if exists "Romaneios visíveis para todos" on romaneios;
create policy "Romaneios visíveis para todos" on romaneios
  for select to authenticated using (true);

drop policy if exists "Inserção de romaneios" on romaneios;
create policy "Inserção de romaneios" on romaneios
  for insert to authenticated with check (true);

drop policy if exists "Admin e Supervisor gerenciam romaneios" on romaneios;
create policy "Admin e Supervisor gerenciam romaneios" on romaneios
  for update to authenticated using (public.is_admin() or public.is_supervisor());

drop policy if exists "Admin deleta romaneios" on romaneios;
create policy "Admin deleta romaneios" on romaneios
  for delete to authenticated using (public.is_admin());

-- Atividades
drop policy if exists "Atividades visíveis para todos" on atividades;
create policy "Atividades visíveis para todos" on atividades
  for select to authenticated using (true);

drop policy if exists "Admin e Supervisor gerenciam atividades" on atividades;
create policy "Admin e Supervisor gerenciam atividades" on atividades
  for all to authenticated using (public.is_admin() or public.is_supervisor());

drop policy if exists "Jovem aprendiz atualiza status da atividade" on atividades;
create policy "Jovem aprendiz atualiza status da atividade" on atividades
  for update to authenticated using (auth.uid() = assigned_to);

-- 9. FORÇAR O PERFIL DO DONO COMO ADMINISTRADOR
insert into public.profiles (id, name, username, function)
select id, 'Bruno Kohler', 'bruno', 'Administrador'
from auth.users where email = 'brunoalekohler@gmail.com'
on conflict (id) do update 
set function = 'Administrador', 
    name = 'Bruno Kohler', 
    username = 'bruno';

-- 10. HABILITAR REALTIME
alter table public.profiles replica identity full;
alter table public.romaneios replica identity full;
alter table public.atividades replica identity full;

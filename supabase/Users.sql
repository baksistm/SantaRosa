-- 
-- SQL FINAL E ROBUSTO PARA CONFIGURAÇÃO DE USUÁRIOS
-- Execute este script no SQL Editor do Supabase
--

-- 1. Criar a tabela de perfis
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default now(),
  username text unique,
  name text,
  function text check (function in ('Administrador', 'Supervisor', 'Jovem aprendiz')) default 'Jovem aprendiz'
);

-- 2. Habilitar RLS
alter table public.profiles enable row level security;

-- 3. FUNÇÃO CRÍTICA: Verifica se é admin sem causar recursão
-- O "security definer" faz a função rodar com permissões de sistema
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and function = 'Administrador'
  );
end;
$$ language plpgsql security definer;

-- 4. Limpar políticas antigas
drop policy if exists "Perfis são visíveis por usuários autenticados." on profiles;
drop policy if exists "Usuários podem atualizar seu próprio perfil." on profiles;
drop policy if exists "Administradores podem atualizar qualquer perfil." on profiles;
drop policy if exists "Administradores podem deletar qualquer perfil." on profiles;
drop policy if exists "Leitura pública para autenticados" on profiles;
drop policy if exists "Atualizar próprio perfil" on profiles;
drop policy if exists "Admin gerencia tudo" on profiles;

-- 5. Criar novas políticas seguras
create policy "Leitura pública para autenticados" on profiles
  for select to authenticated using (true);

create policy "Atualizar próprio perfil" on profiles
  for update to authenticated using (auth.uid() = id);

create policy "Admin gerencia tudo" on profiles
  for all to authenticated using (public.is_admin());

-- 6. Gatilho para novos usuários (Cria perfil automático)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, username, function)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', case when new.email = 'brunoalekohler@gmail.com' then 'Administrador' else 'Jovem aprendiz' end)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. FORÇAR O SEU PERFIL COMO ADMINISTRADOR AGORA
-- Substitua o ID se necessário, mas o e-mail é o garantido
insert into public.profiles (id, name, username, function)
select id, 'Bruno Kohler', 'bruno', 'Administrador'
from auth.users where email = 'brunoalekohler@gmail.com'
on conflict (id) do update 
set function = 'Administrador', 
    name = 'Bruno Kohler', 
    username = 'bruno';

-- 8. Habilitar Realtime
alter table public.profiles replica identity full;

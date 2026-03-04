-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrador', 'Supervisor', 'Jovem aprendiz')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create romaneios table
CREATE TABLE romaneios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  cliente_filial TEXT NOT NULL,
  nf TEXT NOT NULL,
  entrada NUMERIC NOT NULL DEFAULT 0,
  saldo NUMERIC NOT NULL DEFAULT 0,
  numero_romaneio TEXT,
  status TEXT NOT NULL CHECK (status IN ('Cadastrado', 'Pendente', 'Aprovado', 'Recusado')) DEFAULT 'Cadastrado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create atividades table
CREATE TABLE atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  link TEXT,
  periodo TEXT NOT NULL CHECK (periodo IN ('Até o final do dia', 'Até o fim da semana', 'Até amanhã no fim do dia', 'Sem período')),
  concluida BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE romaneios ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Romaneios are viewable by everyone" ON romaneios FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert romaneios" ON romaneios FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins and Supervisors can update romaneios" ON romaneios FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Administrador', 'Supervisor')
  )
);

CREATE POLICY "Atividades are viewable by everyone" ON atividades FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage atividades" ON atividades FOR ALL USING (auth.role() = 'authenticated');

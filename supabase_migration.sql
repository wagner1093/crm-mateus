-- FINAL SYSTEM MIGRATION - CRM MATEUS
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lhogqynmbdmlxhbrmrke/sql

-- 1. EXTEND LEADS TABLE
ALTER TABLE IF EXISTS crmmateus_leads
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS origem_lead TEXT,
  ADD COLUMN IF NOT EXISTS observacoes_contato TEXT,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS urgencia TEXT,
  ADD COLUMN IF NOT EXISTS observacoes_negocio TEXT,
  ADD COLUMN IF NOT EXISTS followup_data DATE,
  ADD COLUMN IF NOT EXISTS followup_intervalo INTEGER,
  ADD COLUMN IF NOT EXISTS followup_tipo TEXT,
  ADD COLUMN IF NOT EXISTS followup_notas TEXT;

-- Update existing stages
UPDATE crmmateus_leads SET etapa = 'Fechado' WHERE etapa = 'Ganho';

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS crmmateus_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco_padrao NUMERIC NOT NULL DEFAULT 0,
  tipo_cobranca TEXT NOT NULL DEFAULT 'Único',
  descricao TEXT,
  cor TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS crmmateus_clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  servicos_contratados TEXT[],
  status TEXT DEFAULT 'Ativo',
  valor_recorrente NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FINANCE TABLE
CREATE TABLE IF NOT EXISTS crmmateus_financeiro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  tipo TEXT CHECK (tipo IN ('Entrada', 'Saída')),
  status TEXT CHECK (status IN ('Pago', 'Pendente')),
  data_vencimento DATE NOT NULL,
  categoria TEXT,
  cliente_id UUID REFERENCES crmmateus_clientes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TEAM TABLE
CREATE TABLE IF NOT EXISTS crmmateus_equipe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Offline',
  permissions TEXT DEFAULT 'Padrão',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS crmmateus_propostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_nome TEXT NOT NULL,
  servico_id UUID REFERENCES crmmateus_servicos(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('Rascunho', 'Enviada', 'Aceita', 'Recusada')) DEFAULT 'Rascunho',
  data_validade DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SEED DATA

-- Seed Services (if not exists)
INSERT INTO crmmateus_servicos (nome, categoria, preco_padrao, tipo_cobranca, descricao, cor)
VALUES 
('Tráfego Pago', 'Marketing', 1500, 'Mensal', 'Gestão de anúncios em Google Ads e Meta Ads.', '#EF4444'),
('Criação de Site', 'Desenvolvimento', 3500, 'Único', 'Desenvolvimento de sites institucionais e landing pages.', '#3B82F6'),
('Criação de Sistema', 'Desenvolvimento', 15000, 'Único', 'Desenvolvimento de sistemas web personalizados.', '#8B5CF6')
ON CONFLICT DO NOTHING;

-- Seed Clients
INSERT INTO crmmateus_clientes (nome, email, whatsapp, servicos_contratados, status, valor_recorrente)
VALUES 
('Mateus Soluções', 'contato@mateus.com', '(11) 98888-7777', ARRAY['Tráfego Pago', 'Criação de Site'], 'Ativo', 1500),
('Academia Fit', 'admin@fit.com', '(11) 97777-6666', ARRAY['Gestão Social Media'], 'Ativo', 800);

-- Seed Finance
INSERT INTO crmmateus_financeiro (descricao, valor, tipo, status, data_vencimento, categoria)
VALUES 
('Mensalidade Mateus Soluções', 1500, 'Entrada', 'Pago', CURRENT_DATE, 'Serviços'),
('Aluguel Escritório', 2000, 'Saída', 'Pago', CURRENT_DATE, 'Infraestrutura'),
('Servidor AWS', 300, 'Saída', 'Pendente', CURRENT_DATE + INTERVAL '5 days', 'Tecnologia');

-- Seed Team
INSERT INTO crmmateus_equipe (name, role, email, status, permissions)
VALUES 
('Mateus Wagner', 'CEO & Founder', 'mateus@agencia.com', 'Online', 'Total'),
('João Designer', 'Lead Design', 'joao@agencia.com', 'Offline', 'Criativo');

-- 7. SECURITY (RLS)
ALTER TABLE crmmateus_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crmmateus_financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE crmmateus_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE crmmateus_propostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated" ON crmmateus_clientes FOR ALL USING (true);
CREATE POLICY "Allow all authenticated" ON crmmateus_financeiro FOR ALL USING (true);
CREATE POLICY "Allow all authenticated" ON crmmateus_equipe FOR ALL USING (true);
CREATE POLICY "Allow all authenticated" ON crmmateus_propostas FOR ALL USING (true);

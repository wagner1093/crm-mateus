-- Migration to add Agency modules: Contracts, Proposals, Support Tickets

-- 1. Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    client_id UUID REFERENCES public.projects(id) ON DELETE SET NULL, -- Mapping to projects/clientes
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'media', -- baixa, media, alta, urgente
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'aberto', -- aberto, em_atendimento, aguardando_cliente, resolvido, encerrado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]'::jsonb
);

CREATE POLICY "Enable all for users in organization" ON public.support_tickets
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 2. Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    contract_number TEXT,
    start_date DATE,
    end_date DATE,
    value NUMERIC(15, 2),
    payment_method TEXT,
    scope TEXT,
    additional_clauses TEXT,
    status TEXT NOT NULL DEFAULT 'rascunho', -- rascunho, ativo, encerrado, cancelado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE POLICY "Enable all for users in organization" ON public.contracts
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 3. Proposals
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    value NUMERIC(15, 2),
    scope TEXT,
    payment_method TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'rascunho', -- rascunho, enviada, aprovada, recusada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE POLICY "Enable all for users in organization" ON public.proposals
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

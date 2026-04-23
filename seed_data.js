const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lhogqynmbdmlxhbrmrke.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2dxeW5tYmRtbHhoYnJtcmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDM3MTgsImV4cCI6MjA5MDY3OTcxOH0.t5khDgoQSo_fbjv-sv45u5S8p2QCLGRhrwnsoB2AHuE');

async function seed() {
  console.log("🚀 Semeando dados em crmmateus_...");

  // SERVICOS
  const { data: servicos } = await supabase.from('crmmateus_servicos').upsert([
    { nome: 'Gestão de Tráfego', preco_padrao: 1500, tipo_cobranca: 'Mensal', categoria: 'Marketing', status: 'Ativo' },
    { nome: 'Social Media', preco_padrao: 1200, tipo_cobranca: 'Mensal', categoria: 'Marketing', status: 'Ativo' },
    { nome: 'Web Design', preco_padrao: 2500, tipo_cobranca: 'Único', categoria: 'Design', status: 'Ativo' }
  ]).select();

  // CLIENTES
  const { data: clientes } = await supabase.from('crmmateus_clientes').upsert([
    { nome: 'Clinica Sorriso', email: 'sorriso@exemplo.com', whatsapp: '11999999999', valor_recorrente: 1500, status: 'Ativo' },
    { nome: 'Auto Peças Silva', email: 'silva@exemplo.com', whatsapp: '11888888888', valor_recorrente: 1200, status: 'Ativo' }
  ]).select();

  if (clientes) {
    // LEADS
    await supabase.from('crmmateus_leads').insert([
      { nome: 'Novo Lead 1', contato: '11777777777', temperatura: 'Quente', etapa: 'Prospecção', valor_estimado: 5000 },
      { nome: 'Novo Lead 2', contato: '11666666666', temperatura: 'Morno', etapa: 'Qualificação', valor_estimado: 3000 }
    ]);

    // FINANCEIRO
    await supabase.from('crmmateus_financeiro').insert([
      { tipo: 'Entrada', descricao: 'Mensalidade Sorriso', valor: 1500, data_vencimento: '2026-04-20', status: 'Pago', categoria: 'Serviços', cliente_id: clientes[0].id },
      { tipo: 'Entrada', descricao: 'Mensalidade Silva', valor: 1200, data_vencimento: '2026-04-21', status: 'Pago', categoria: 'Serviços', cliente_id: clientes[1].id },
      { tipo: 'Saída', descricao: 'Aluguel Escritório', valor: 800, data_vencimento: '2026-04-10', status: 'Pago', categoria: 'Infra' }
    ]);
  }

  console.log("✨ Dados semeados!");
}
seed();

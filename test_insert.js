const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lhogqynmbdmlxhbrmrke.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2dxeW5tYmRtbHhoYnJtcmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDM3MTgsImV4cCI6MjA5MDY3OTcxOH0.t5khDgoQSo_fbjv-sv45u5S8p2QCLGRhrwnsoB2AHuE');

async function run() {
  const { data, error } = await supabase.from('crm_mateus_clientes').insert([
    { nome: 'Empresa Teste 1', email: 'teste1@exemplo.com', whatsapp: '11999999999', valor_recorrente: 2000, status: 'Ativo' },
    { nome: 'Empresa Teste 2', email: 'teste2@exemplo.com', whatsapp: '11888888888', valor_recorrente: 1500, status: 'Ativo' }
  ]);
  if (error) console.error("Erro:", error);
  else console.log("Dados inseridos!");
}
run();

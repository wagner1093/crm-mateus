const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lhogqynmbdmlxhbrmrke.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2dxeW5tYmRtbHhoYnJtcmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDM3MTgsImV4cCI6MjA5MDY3OTcxOH0.t5khDgoQSo_fbjv-sv45u5S8p2QCLGRhrwnsoB2AHuE');

async function listTables() {
  const { data, error } = await supabase.from('crm_mateus_servicos').select('*').limit(1);
  console.log("Servicos table exists?", !error);
  if (error) console.log("Error servicos:", error.message);

  const { data: d2, error: e2 } = await supabase.from('crmmateus_clientes').select('*').limit(1);
  console.log("crmmateus_clientes exists?", !e2);
}
listTables();

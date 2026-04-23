const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lhogqynmbdmlxhbrmrke.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2dxeW5tYmRtbHhoYnJtcmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDM3MTgsImV4cCI6MjA5MDY3OTcxOH0.t5khDgoQSo_fbjv-sv45u5S8p2QCLGRhrwnsoB2AHuE');

const sql = `
-- CRM MATEUS TABLES SETUP
-- Since we can't run raw SQL easily via JS client without RPC, 
-- we will try to create tables via individual calls or just report that 
-- the user should run the SQL in the dashboard if this fails.
`;

async function setup() {
    console.log("Checking connection...");
    const { data, error } = await supabase.from('crm_mateus_servicos').select('*').limit(1);
    if (error && error.code === '42P01') {
        console.log("Tables don't exist yet. Please run the SQL migration in the Supabase Dashboard.");
        console.log("I have generated the SQL for you in implementation_plan.md");
    } else {
        console.log("Tables already exist or connection failed:", error ? error.message : "OK");
    }
}

setup();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lhogqynmbdmlxhbrmrke.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2dxeW5tYmRtbHhoYnJtcmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDM3MTgsImV4cCI6MjA5MDY3OTcxOH0.t5khDgoQSo_fbjv-sv45u5S8p2QCLGRhrwnsoB2AHuE');

async function test() {
    const { data: s, error: se } = await supabase.from('services').select('*').limit(1);
    console.log('services:', se ? se.message : 'EXISTS');
    const { data: p, error: pe } = await supabase.from('projects').select('*').limit(1);
    console.log('projects:', pe ? pe.message : 'EXISTS');
}

test();

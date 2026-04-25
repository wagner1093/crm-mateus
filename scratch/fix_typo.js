
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTypo() {
  const { data, error } = await supabase
    .from('crmmateus_servicos')
    .update({ nome: 'Hospedagem de Sites' })
    .ilike('nome', '%Hosepdagem%');

  if (error) {
    console.error('Error fixing typo:', error);
  } else {
    console.log('Typo fixed successfully:', data);
  }
}

fixTypo();

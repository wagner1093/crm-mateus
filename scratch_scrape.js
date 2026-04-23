async function scrape() {
  const r = await fetch('https://blindadora-crm.vercel.app/dashboard');
  const html = await r.text();
  const fs = require('fs');
  fs.writeFileSync('scratch_html.html', html);
  console.log('Saved to scratch_html.html');
}
scrape();

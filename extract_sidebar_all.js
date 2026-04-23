const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Wagner/.gemini/antigravity/brain/3beb45d7-92db-4483-9a3f-8329ddbd422e/.system_generated/logs/overview.txt', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  try {
    const data = JSON.parse(lines[i]);
    if (data.source === 'MODEL' && data.tool_calls) {
      for (const tc of data.tool_calls) {
        if (tc.response && tc.response.output && tc.response.output.includes('Sidebar.tsx') && tc.response.output.includes('Total Lines')) {
          const out = tc.response.output;
          const start = out.indexOf('1:');
          if (start !== -1) {
            fs.writeFileSync(`Sidebar_viewed_${i}.tsx`, out.substring(start).replace(/^\d+: /gm, ''));
            console.log(`Saved Sidebar_viewed_${i}.tsx`);
          }
        }
      }
    }
  } catch(e) {}
}

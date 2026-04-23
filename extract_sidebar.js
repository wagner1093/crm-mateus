const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Wagner/.gemini/antigravity/brain/3beb45d7-92db-4483-9a3f-8329ddbd422e/.system_generated/logs/overview.txt', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"step_index":102') || lines[i].includes('"step_index":100')) {
    try {
      const data = JSON.parse(lines[i]);
      if (data.tool_calls && data.tool_calls[0] && data.tool_calls[0].response && data.tool_calls[0].response.output) {
         const out = data.tool_calls[0].response.output;
         if (out.includes('Sidebar.tsx')) {
           const start = out.indexOf('1:');
           if (start !== -1) {
             fs.writeFileSync('Sidebar_original.tsx', out.substring(start).replace(/^\d+: /gm, ''));
             console.log('Restored to Sidebar_original.tsx from line ' + i);
           }
         }
      }
    } catch (e) {
      console.log(e);
    }
  }
}

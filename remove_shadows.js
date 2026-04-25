const fs = require('fs');
const file = 'src/app/configuracoes/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all shadow classes
content = content.replace(/\bshadow-[a-zA-Z0-9\/\-\[\]_(),.]+\b/g, '');

// Clean up double spaces that might be left behind inside classNames
content = content.replace(/  +/g, ' ');
content = content.replace(/className=" /g, 'className="');
content = content.replace(/ "/g, '"');

fs.writeFileSync(file, content);
console.log('Shadows removed');

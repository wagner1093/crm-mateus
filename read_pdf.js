const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('CRM_PRO_Especificacao_Tecnica (1).pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf_output.md', data.text, 'utf8');
}).catch(function(err) {
    console.error(err);
});

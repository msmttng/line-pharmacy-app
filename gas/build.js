const fs = require('fs');
const htmlSource = 'C:/Users/masam/.gemini/antigravity/scratch/line-pharmacy-questionnaire-github-pages/index.html';
const cssSource = 'C:/Users/masam/.gemini/antigravity/scratch/line-pharmacy-questionnaire-github-pages/style.css';
const targetHtml = 'C:/Users/masam/.gemini/antigravity/scratch/line-pharmacy-questionnaire-gas/index.html';

const html = fs.readFileSync(htmlSource, 'utf8');
const css = fs.readFileSync(cssSource, 'utf8');

const injected = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>');

fs.writeFileSync(targetHtml, injected, 'utf8');
console.log('Successfully injected CSS into ' + targetHtml);

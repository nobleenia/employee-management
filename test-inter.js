const fs = require('fs');
const js = fs.readFileSync('public/script.js', 'utf8');
const lines = js.split('\n');
console.log(lines.slice(840, 855).join('\n'));

const fs = require('fs');
let s = fs.readFileSync('public/app.html', 'utf8');

s = s.replace(/script\.js\?v=[0-9]+/g, 'script.js?v=' + Date.now());
fs.writeFileSync('public/app.html', s);

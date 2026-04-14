const fs = require('fs');
const html = fs.readFileSync('public/app.html', 'utf8');
const js = fs.readFileSync('public/script.js', 'utf8');

if (!js.includes('document.getElementById(\'btn-add-employee\').addEventListener')) {
    console.log('No btn-add-employee listener in script.js.');
}

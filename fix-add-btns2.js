const fs = require('fs');
let content = fs.readFileSync('public/script.js', 'utf8');

content = content.replace(
  "document.getElementById('btn-add-employee').addEventListener('click', openEmployeeModal);",
  "document.getElementById('btn-add-employee').addEventListener('click', window.openEmployeeModal || openEmployeeModalOrig);"
);

fs.writeFileSync('public/script.js', content);

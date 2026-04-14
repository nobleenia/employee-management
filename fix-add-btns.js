const fs = require('fs');
let content = fs.readFileSync('public/script.js', 'utf8');

const attachPos = content.indexOf('document.getElementById(\'employee-modal-form\').addEventListener(\'submit\', saveEmployee);');

const injection = `
    document.getElementById('btn-add-employee').addEventListener('click', openEmployeeModal);
    document.getElementById('btn-add-department').addEventListener('click', openDepartmentModal);
    
`;

content = content.slice(0, attachPos) + injection + content.slice(attachPos);
fs.writeFileSync('public/script.js', content);

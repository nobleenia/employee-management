const fs = require('fs');
let s = fs.readFileSync('public/script.js', 'utf8');

const target1 = `        emergencyContact: document.getElementById('profile-emergency').value`;
const replace1 = `        emergencyContact: document.getElementById('profile-emergency-name').value + (document.getElementById('profile-emergency-phone').value ? " - " + document.getElementById('profile-emergency-phone').value : "")`;

const target2 = `document.getElementById('profile-emergency').value = emp.emergencyContact || '';`;
const replace2 = `const emC = emp.emergencyContact || '';
        const emParts = emC.split(' - ');
        document.getElementById('profile-emergency-name').value = emParts[0] || '';
        document.getElementById('profile-emergency-phone').value = emParts[1] || '';`;

s = s.replace(target1, replace1);
if(s.includes("document.getElementById('profile-emergency').value")) {
    s = s.replace(`document.getElementById('profile-emergency').value = emp.emergencyContact || '';`, replace2);
} else {
    // maybe it sets it differently
}

fs.writeFileSync('public/script.js', s);

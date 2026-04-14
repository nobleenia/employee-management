const fs = require('fs');
let s = fs.readFileSync('public/script.js', 'utf8');

const target = "document.getElementById('profile-emergency').value = data.emergencyContact || '';";
const replace = `        const emC = data.emergencyContact || '';
        const emParts = emC.split(' - ');
        const elName = document.getElementById('profile-emergency-name');
        const elPhone = document.getElementById('profile-emergency-phone');
        if (elName) elName.value = emParts[0] || '';
        if (elPhone) elPhone.value = emParts[1] || '';`;

if(s.includes(target)) {
    s = s.replace(target, replace);
    fs.writeFileSync('public/script.js', s);
    console.log("Replaced");
} else {
    console.log("Not found");
}

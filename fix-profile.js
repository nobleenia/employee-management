const fs = require('fs');
let script = fs.readFileSync('public/script.js', 'utf8');

// Expose the real error message for profile update
script = script.replace(
    /if\(res\.ok\) showToast\('Profile updated'\);\s*else showToast\('Error updating profile', 'error'\);/g,
    `if(res.ok) showToast('Profile updated');
        else {
            const err = await res.json();
            showToast(err.msg || 'Error updating profile', 'error');
        }`
);

fs.writeFileSync('public/script.js', script);

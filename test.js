const http = require('http');

const run = async () => {
    const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email:'admin@acme.com', password:'password123'})
    });
    
    // extract cookie
    const cookies = res.headers.get('set-cookie');
    
    const res2 = await fetch('http://localhost:3000/api/admin/org-tree', {
        headers: { 'Cookie': cookies }
    });
    console.log("Tree Status:", res2.status);
    console.log("Tree Body:", await res2.text());
};
run();

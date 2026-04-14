const fs = require('fs');
let script = fs.readFileSync('public/script.js', 'utf8');

const authLogicTarget = `async function checkAuth() {
    const userStr = localStorage.getItem('user');`;

const authLogicReplace = `async function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteId = urlParams.get('invite');
    
    const userStr = localStorage.getItem('user');
    
    if (inviteId && !userStr) {
        try {
            const res = await fetch(\`/api/auth/invite/\${inviteId}\`);
            if(res.ok) {
                window.inviteData = await res.json();
                window.inviteId = inviteId;
                renderAuthForm('register');
                showView('auth-view');
                return;
            } else {
                showToast('Invalid or expired invite link', 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch(e) { console.error(e); }
    }
`;

if(!script.includes("const inviteId = urlParams.get('invite');")) {
    script = script.replace(authLogicTarget, authLogicReplace);
}

const renderAuthTarget = `    } else {
        container.innerHTML = \`
            <div class="auth-header">
                <h2>EmployeeHub</h2>
                <p class="subtitle">Create your account</p>
            </div>
            <form onsubmit="submitAuth(event, 'register')">
                <div class="form-group">

                    <label>Email</label>
                    <input type="email" id="auth-email" placeholder="john@company.com" required>
                </div>`;

const renderAuthReplace = `    } else {
        const nameDisplay = window.inviteData ? \`<p style="margin-bottom: 15px; color: var(--accent-blue);">Joining as: <strong>\${window.inviteData.name}</strong></p>\` : \`\`;
        const emailAttr = window.inviteData && window.inviteData.email ? 'readonly' : 'required';
        const emailVal = window.inviteData && window.inviteData.email ? window.inviteData.email : '';
        const emailHint = window.inviteData ? '' : 'placeholder="john@company.com"';
        
        container.innerHTML = \`
            <div class="auth-header">
                <h2>EmployeeHub</h2>
                <p class="subtitle">Create your account</p>
                \${nameDisplay}
            </div>
            <form onsubmit="submitAuth(event, 'register')">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="auth-email" \${emailHint} value="\${emailVal}" \${emailAttr} \${!window.inviteData ? 'required' : ''}>
                </div>`;

if(!script.includes("const emailAttr = window.inviteData")) {
    script = script.replace(renderAuthTarget, renderAuthReplace);
}


const submitAuthTarget = `    const body = { email, password };
    if (type === 'register') {
        const confirmPw = document.getElementById('auth-confirm-password').value;
        if(password !== confirmPw) return showToast('Passwords do not match', 'error');
    }`;

const submitAuthReplace = `    const body = { email, password };
    if (window.inviteId && type === 'register') {
        body.inviteId = window.inviteId;
    }
    if (type === 'register') {
        const confirmPw = document.getElementById('auth-confirm-password').value;
        if(password !== confirmPw) return showToast('Passwords do not match', 'error');
    }`;

if(!script.includes("if (window.inviteId && type === 'register')")) {
    script = script.replace(submitAuthTarget, submitAuthReplace);
}

const cleanupTarget = `            localStorage.setItem('user', JSON.stringify(data.user));
            checkAuth();`;
const cleanupReplace = `            localStorage.setItem('user', JSON.stringify(data.user));
            if (window.inviteId) {
                window.inviteId = null;
                window.inviteData = null;
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            checkAuth();`;

if(!script.includes("window.inviteId = null;")) {
    script = script.replace(cleanupTarget, cleanupReplace);
}

fs.writeFileSync('public/script.js', script);

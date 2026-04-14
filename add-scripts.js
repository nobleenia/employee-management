const fs = require('fs');
let script = fs.readFileSync('public/script.js', 'utf8');

// Insert page routers
script = script.replace(
  "if (page === 'departments') loadDepartmentsData();", 
  "if (page === 'departments') loadDepartmentsData();\n    if (page === 'profile') loadProfileData();\n    if (page === 'leaves') loadLeavesData();"
);

// Insert profile and leave functions
const newFuncs = `

// --- PROFILE ---
async function loadProfileData() {
    try {
        const res = await fetch('/api/employees/me', { credentials: 'same-origin' });
        if(!res.ok) {
            if(res.status === 404) {
               document.getElementById('profile-dept-info').innerHTML = '<p style="color:red;">Error: You have not claimed your employee profile yet. <button onclick="claimProfile()" class="btn btn-dark" style="margin-top:10px;">Claim Account Now</button></p>';
               return;
            }
            throw new Error('Failed');
        }
        const data = await res.json();
        
        document.getElementById('profile-phone').value = data.phone || '';
        document.getElementById('profile-address').value = data.address || '';
        document.getElementById('profile-emergency').value = data.emergencyContact || '';
        
        document.getElementById('profile-dept-info').innerHTML = 
            \`Your Role: <strong>\${data.role || 'Unassigned'}</strong> | Department: \${data.department ? data.department.name : 'None'}\`;
            
    } catch(e) { console.error('Error loading profile'); }
}

async function claimProfile() {
    try {
        const res = await fetch('/api/employees/claim', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ email: currentUser.email })
        });
        if(res.ok) {
            showToast('Account claimed successfully!');
            loadProfileData();
        } else {
            const err = await res.json();
            showToast(err.msg || 'Could not claim account', 'error');
        }
    } catch(e) { showToast('Server Error', 'error'); }
}

document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        phone: document.getElementById('profile-phone').value,
        address: document.getElementById('profile-address').value,
        emergencyContact: document.getElementById('profile-emergency').value
    };
    
    try {
        const res = await fetch('/api/employees/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });
        if(res.ok) showToast('Profile updated');
        else showToast('Error updating profile', 'error');
    } catch(e) { showToast('Server Error', 'error'); }
});


// --- LEAVES ---
async function loadLeavesData() {
    try {
        const isAdmin = currentUser.role === 'admin';
        const url = isAdmin ? '/api/leave-requests' : '/api/leave-requests/my-requests';
        const res = await fetch(url, { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        
        const tbody = document.getElementById('leave-table-body');
        tbody.innerHTML = '';
        
        if (isAdmin) document.getElementById('leave-action-header').style.display = 'table-cell';

        data.forEach(req => {
            const tr = document.createElement('tr');
            
            // Format dates
            const start = new Date(req.startDate).toLocaleDateString();
            const end = new Date(req.endDate).toLocaleDateString();
            const name = req.employeeId ? (req.employeeId.name + ' ' + req.employeeId.surname) : (currentUser ? currentUser.name : 'Unknown');

            let classStatus = 'badge-status';
            if (req.status === 'Denied') classStatus += ' error';
            
            let actions = '';
            if (isAdmin && req.status === 'Pending') {
                actions = \`
                <td>
                    <button class="btn btn-dark" style="padding:4px 8px; font-size:12px; margin-right:5px;" onclick="updateLeave('\${req._id}', 'Approved')">Approve</button>
                    <button class="btn" style="padding:4px 8px; font-size:12px; background: #ef4444; color:white; border:none; border-radius:4px; cursor:pointer;" onclick="updateLeave('\${req._id}', 'Denied')">Deny</button>
                </td>\`;
            } else if (isAdmin) {
                 actions = '<td></td>';
            }

            tr.innerHTML = \`
                <td>\${escapeHtml(name)}</td>
                <td>\${escapeHtml(req.type)}</td>
                <td>\${start}</td>
                <td>\${end}</td>
                <td><span class="\${classStatus}">\${escapeHtml(req.status)}</span></td>
                \${actions}
            \`;
            tbody.appendChild(tr);
        });

    } catch(e) {  }
}

document.getElementById('leave-modal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        type: document.getElementById('leave-type').value,
        startDate: document.getElementById('leave-start').value,
        endDate: document.getElementById('leave-end').value
    };
    
    try {
        const res = await fetch('/api/leave-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });
        if(res.ok) {
             showToast('Leave requested successfully');
             closeModal('leave-modal');
             loadLeavesData();
        } else {
             showToast('Error requesting leave', 'error');
        }
    } catch(e) { showToast('Server Error', 'error'); }
});

async function updateLeave(id, status) {
    if(!confirm(\`Are you sure you want to mark this as \${status}?\`)) return;
    try {
        const res = await fetch(\`/api/leave-requests/\${id}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ status })
        });
        if(res.ok) {
             showToast(\`Leave \${status}\`);
             loadLeavesData();
        } else showToast('Error updating', 'error');
    } catch(err) { showToast('Server Error', 'error');}
}

`;

fs.writeFileSync('public/script.js', script + newFuncs, 'utf8');

const fs = require('fs');
let s = fs.readFileSync('public/script.js', 'utf8');

// The replacement for employee actions
const empActionsTarget = `                    <button class="action-btn" title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    <button class="action-btn" title="Edit Employee" onclick="editEmployee('\${emp._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>`;

const empActionsReplace = `                    <button class="action-btn" title="Toggle Status" onclick="toggleEmpStatus('\${emp._id}', '\${emp.status}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    <button class="action-btn" title="Edit Employee" onclick="editEmployee('\${emp._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button class="action-btn" title="Delete Employee" onclick="deleteEmployee('\${emp._id}')" style="color: #ef4444;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>`;

if(s.includes(empActionsTarget)) {
    s = s.replace(empActionsTarget, empActionsReplace);
    console.log("Emp actions replaced");
}

const deptActionsTarget = `actionsHtml += \`<button class="action-btn" title="Edit" onclick="editDepartment('\${dept._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>\`;`;

const deptActionsReplace = `actionsHtml += \`<button class="action-btn" title="Show/Hide" onclick="showToast('View Department action triggered')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>\`;
                actionsHtml += \`<button class="action-btn" title="Edit" onclick="editDepartment('\${dept._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>\`;
                actionsHtml += \`<button class="action-btn" title="Delete" onclick="deleteDepartment('\${dept._id}')" style="color: #ef4444;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>\`;`;

if(s.includes(deptActionsTarget)) {
    s = s.replace(deptActionsTarget, deptActionsReplace);
    console.log("Dept actions replaced");
}

// Add the JS implementations for these toggles/deletes
const implementations = `
window.toggleEmpStatus = async function(id, currentStatus) {
    const newStatus = (currentStatus === 'active') ? 'inactive' : 'active';
    try {
        const res = await fetch(\`/api/employees/\${id}/status\`, { 
            method: 'PUT', 
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({status: newStatus}),
            credentials: 'same-origin' 
        });
        if(res.ok) {
            showToast('Employee status updated');
            loadEmployeesData(); 
        } else {
            showToast('Failed to update status', 'error');
        }
    } catch(e) { showToast('Server Error', 'error'); }
};

window.deleteDepartment = async function(id) {
    if(!confirm("Are you sure you want to delete this department?")) return;
    try {
        const res = await fetch(\`/api/departments/\${id}\`, { method: 'DELETE', credentials: 'same-origin' });
        if(res.ok) {
             showToast('Department deleted');
             loadDepartmentsData();
             loadDashboardData();
        } else {
           const err = await res.json();
           showToast(err.msg || 'Error deleting', 'error');
        }
    } catch(err) { showToast('Server Error', 'error');}
};
`;

s += implementations;

fs.writeFileSync('public/script.js', s);

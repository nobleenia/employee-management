const fs = require('fs');

let script = fs.readFileSync('public/script.js', 'utf8');

// Add editDepartment
if (!script.includes("window.editDepartment =")) {
    script += `
window.editDepartment = async function(id) {
    try {
        const res = await fetch(\`/api/departments/\${id}\`, { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Error fetching department');
        const dept = await res.json();
        document.getElementById('dept-id').value = dept._id;
        document.getElementById('dept-name').value = dept.name;
        document.getElementById('dept-description').value = dept.description || '';
        document.getElementById('department-modal-title').innerText = 'Edit Department';
        openModal('department-modal');
    } catch(e) { showToast('Error fetching department', 'error'); }
};
`;
}

// Convert confirm to custom confirm modal for deleteEmployee and deleteDepartment
script = script.replace(/if\(!confirm\(.*?\)\) return;/g, ''); // We will wrap the calls.
// Wait, instead of reg-exing, let's redefine the delete functions to use our custom modal.
script = script.replace(/window\.deleteEmployee = async function\(id\) \{([\s\S]*?)\};/, `
window.deleteEmployee = function(id) {
    window.pendingDeleteAction = async () => {
        try {
            const res = await fetch(\`/api/employees/\${id}\`, { method: 'DELETE', credentials: 'same-origin' });
            if(res.ok) {
                 showToast('Employee deleted');
                 loadEmployeesData(); 
                 loadDashboardData();
            } else showToast('Error deleting', 'error');
        } catch(err) { showToast('Server Error', 'error'); }
    };
    document.getElementById('confirm-modal-title').innerText = 'Delete Employee';
    document.getElementById('confirm-modal-msg').innerText = 'Are you sure you want to delete this employee?';
    openModal('confirm-modal');
};
`);

script = script.replace(/window\.deleteDepartment = async function\(id\) \{([\s\S]*?)\};/, `
window.deleteDepartment = function(id) {
    window.pendingDeleteAction = async () => {
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
    document.getElementById('confirm-modal-title').innerText = 'Delete Department';
    document.getElementById('confirm-modal-msg').innerText = 'Are you sure you want to delete this department?';
    openModal('confirm-modal');
};
`);

fs.writeFileSync('public/script.js', script);

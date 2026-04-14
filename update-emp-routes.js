const fs = require('fs');
const content = fs.readFileSync('public/script.js', 'utf8');

const startIdx = content.indexOf('async function loadEmployeesData() {');
const endIdx = content.indexOf('async function loadDepartmentsData() {', startIdx);

const replacement = `let currentEmpSearch = '';
let currentEmpFilter = '';
let empViewMode = 'list';

async function loadEmployeesData() {
    try {
        const filterSelect = document.getElementById('employee-dept-filter');
        if (filterSelect.options.length <= 1) {
            const dr = await fetch('/api/departments', { credentials: 'same-origin' });
            if (dr.ok) {
                const depts = await dr.json();
                filterSelect.innerHTML = '<option value="">All Departments</option>';
                depts.forEach(d => {
                    filterSelect.innerHTML += \`<option value="\${d._id}">\${d.name}</option>\`;
                });
            }
        }

        let url = '/api/employees?limit=100';
        if (currentEmpSearch) url += \`&name=\${encodeURIComponent(currentEmpSearch)}\`;
        if (currentEmpFilter) url += \`&department=\${encodeURIComponent(currentEmpFilter)}\`;

        const res = await fetch(url, { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Failed');
        const data = await res.json();
        
        const empTable = document.getElementById('employee-table-body');
        const empGrid = document.getElementById('employee-grid-container');
        document.getElementById('employee-count-label').innerHTML = \`Showing \${data.employees.length} employees\`;
        
        empTable.innerHTML = '';
        empGrid.innerHTML = '';

        if (empViewMode === 'list') {
            document.getElementById('employee-table-container').style.display = 'block';
            empGrid.style.display = 'none';
        } else {
            document.getElementById('employee-table-container').style.display = 'none';
            empGrid.style.display = 'grid';
        }
        
        data.employees.forEach(emp => {
            const deptName = emp.department ? emp.department.name : 'Unassigned';
            const initials = emp.name[0].toUpperCase() + emp.surname[0].toUpperCase();
            
            let actionsHtml = \`<div class="action-btns">\`;
            if (currentUser && currentUser.role === 'admin') {
                actionsHtml += \`
                    <button class="action-btn" title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    <button class="action-btn" title="Edit Employee" onclick="editEmployee('\${emp._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                \`;
            } else {
                 actionsHtml += \`<button class="action-btn" title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>\`;
            }
             actionsHtml += \`</div>\`;

            if (empViewMode === 'list') {
                const tr = document.createElement('tr');
                tr.innerHTML = \`
                    <td class="emp-cell">
                        <div class="emp-avatar">\${initials}</div>
                        <div class="emp-details">
                            <span class="emp-name">\${escapeHtml(emp.name)} \${escapeHtml(emp.surname)}</span>
                            <span class="emp-phone">\${escapeHtml(emp.phone || '+1 (555) 123-4567')}</span>
                        </div>
                    </td>
                    <td><span class="badge-dept">\${escapeHtml(deptName)}</span></td>
                    <td>\${escapeHtml(emp.role || 'Unassigned')}</td>
                    <td style="color:#64748b;">\${escapeHtml(emp.email || \`\${escapeHtml(emp.name.toLowerCase())}.\${escapeHtml(emp.surname.toLowerCase())}@company.com\`)}</td>
                    <td><span class="badge-status">\${escapeHtml(emp.status || 'active')}</span></td>
                    <td>\${actionsHtml}</td>
                \`;
                empTable.appendChild(tr);
            } else {
                const card = document.createElement('div');
                card.className = 'card dept-card';
                card.innerHTML = \`
                    <div style="display:flex; justify-content:space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div class="emp-cell" style="margin-bottom: 0;">
                            <div class="emp-avatar">\${initials}</div>
                            <div class="emp-details">
                                <span class="emp-name">\${escapeHtml(emp.name)} \${escapeHtml(emp.surname)}</span>
                                <span class="emp-phone" style="color:#64748b; font-size:12px;">\${escapeHtml(emp.role || 'Unassigned')}</span>
                            </div>
                        </div>
                        \${actionsHtml}
                    </div>
                    <div style="font-size:13px; color:#64748b; margin-bottom: 12px;">
                        <div>\${escapeHtml(emp.email || \`\${escapeHtml(emp.name.toLowerCase())}.\${escapeHtml(emp.surname.toLowerCase())}@company.com\`)}</div>
                        <div style="margin-top: 4px;">\${escapeHtml(emp.phone || '+1 (555) 123-4567')}</div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: auto;">
                        <span class="badge-dept">\${escapeHtml(deptName)}</span>
                        <span class="badge-status">\${escapeHtml(emp.status || 'active')}</span>
                    </div>
                \`;
                empGrid.appendChild(card);
            }
        });

    } catch(e) {
        showToast('Error loading employees', 'error');
    }
}

`;

fs.writeFileSync('public/script.js', content.slice(0, startIdx) + replacement + content.slice(endIdx));

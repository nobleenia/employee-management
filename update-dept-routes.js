const fs = require('fs');
const content = fs.readFileSync('public/script.js', 'utf8');

const startIdx = content.indexOf('async function loadDepartmentsData() {');
const endIdx = content.indexOf('function escapeHtml(unsafe)', startIdx);

const replacement = `let deptViewMode = 'grid';

async function loadDepartmentsData() {
     try {
        const res = await fetch('/api/departments', { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Failed');
        const data = await res.json();
        
        document.getElementById('departments-kpis').innerHTML = \`
            <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Total Departments</div>
                        <div class="kpi-value">\${data.length}</div>
                    </div>
                    <div class="kpi-icon gray"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                </div>
            </div>
            <!-- Mocked KPIs mimicking prototype -->
            <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Total Employees</div>
                        <div class="kpi-value">38</div>
                    </div>
                    <div class="kpi-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
                </div>
            </div>
             <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Avg Team Size</div>
                        <div class="kpi-value">6</div>
                    </div>
                    <div class="kpi-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
                </div>
            </div>
        \`;

        const deptGrid = document.getElementById('departments-grid');
        const deptTable = document.getElementById('departments-table-body');
        const deptTableContainer = document.getElementById('departments-table-container');
        
        deptGrid.innerHTML = '';
        deptTable.innerHTML = '';
        
        if (deptViewMode === 'grid') {
            deptGrid.style.display = 'grid';
            deptTableContainer.style.display = 'none';
        } else {
            deptGrid.style.display = 'none';
            deptTableContainer.style.display = 'block';
        }

        data.forEach(dept => {
            let actionsHtml = \`<div class="action-btns">\`;
            if (currentUser && currentUser.role === 'admin') {
                actionsHtml += \`<button class="action-btn" title="Edit" onclick="editDepartment('\${dept._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>\`;
            } else {
                actionsHtml += \`<button class="action-btn" title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>\`;
            }
            actionsHtml += \`</div>\`;
            
            if (deptViewMode === 'grid') {
                const card = document.createElement('div');
                card.className = 'card dept-card';
                card.innerHTML = \`
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <h4>\${escapeHtml(dept.name)}</h4>
                        \${actionsHtml}
                    </div>
                    <span class="dept-count">\${escapeHtml(dept.manager ? dept.manager.name : 'Unassigned')}</span>
                    <p style="margin-top:12px;color:#64748b;">\${escapeHtml(dept.description || '')}</p>
                \`;
                deptGrid.appendChild(card);
            } else {
                const tr = document.createElement('tr');
                tr.innerHTML = \`
                    <td><span style="font-weight: 500;">\${escapeHtml(dept.name)}</span></td>
                    <td>\${escapeHtml(dept.manager ? dept.manager.name : 'Unassigned')}</td>
                    <td>Multiple</td>
                    <td>$0.00</td>
                    <td><span class="badge-status">Active</span></td>
                    <td>\${actionsHtml}</td>
                \`;
                deptTable.appendChild(tr);
            }
        });

    } catch(e) {
        showToast('Error loading departments', 'error');
    }
}

`;
fs.writeFileSync('public/script.js', content.slice(0, startIdx) + replacement + content.slice(endIdx));

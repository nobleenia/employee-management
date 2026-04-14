let currentUser = null;
let currentView = 'dashboard';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    attachGlobalListeners();
});

// View Manager
function showView(viewId) {
    document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
    document.getElementById(viewId).style.display = 'flex';
    if (viewId === 'app-view') {
        const uName = currentUser?.name || 'User';
        const role = currentUser?.role || 'user';
        document.getElementById('current-user-name').innerText = uName;
        document.getElementById('current-user-role').innerText = role;
        document.getElementById('current-user-initial').innerText = uName.charAt(0).toUpperCase();
        
        switchPage('dashboard');
        loadDashboardData();
    }
}

function switchPage(page) {
    currentView = page;
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    document.getElementById(`page-${page}`).style.display = 'block';
    const activeNav = document.querySelector(`.nav-item[data-target="${page}"]`);
    if(activeNav) activeNav.classList.add('active');

    if (page === 'dashboard') loadDashboardData();
    if (page === 'employees') loadEmployeesData();
    if (page === 'departments') loadDepartmentsData();
    if (page === 'profile') loadProfileData();
    if (page === 'leaves') loadLeavesData();
    if (page === 'org-chart') loadOrgChart();
    if (page === 'documents') initDocumentsPage();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-body">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = 0; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Authentication Logic
async function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        showView('app-view');
    } else {
        renderAuthForm('login');
        showView('auth-view');
    }
}

function renderAuthForm(type) {
    const container = document.getElementById('auth-form-container');
    
    if (type === 'login') {
        container.innerHTML = `
            <div class="auth-header">
                <h2>EmployeeHub</h2>
                <p class="subtitle">Sign in to your account</p>
            </div>
            <form onsubmit="submitAuth(event, 'login')">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="auth-email" placeholder="admin@company.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="auth-password" placeholder="Enter your password" required>
                </div>
                <button type="submit" class="btn btn-dark btn-block auth-btn">Sign In</button>
            </form>
            <p class="auth-switch">
                Don't have an account? <a href="#" onclick="event.preventDefault(); renderAuthForm('register')">Register</a>
            </p>
        `;
    } else {
        container.innerHTML = `
            <div class="auth-header">
                <h2>EmployeeHub</h2>
                <p class="subtitle">Create your account</p>
            </div>
            <form onsubmit="submitAuth(event, 'register')">
                <div class="form-group">

                    <label>Email</label>
                    <input type="email" id="auth-email" placeholder="john@company.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="auth-password" placeholder="At least 6 characters" required>
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" id="auth-confirm-password" placeholder="Re-enter your password" required>
                </div>
                <button type="submit" class="btn btn-dark btn-block auth-btn">Create Account</button>
            </form>
            <p class="auth-switch">
                Already have an account? <a href="#" onclick="event.preventDefault(); renderAuthForm('login')">Sign In</a>
            </p>
        `;
    }
}

async function submitAuth(e, type) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    const body = { email, password };
    if (type === 'register') {
        const confirmPw = document.getElementById('auth-confirm-password').value;
        if(password !== confirmPw) return showToast('Passwords do not match', 'error');
    }

    try {
        const res = await fetch(`/api/auth/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            checkAuth();
            showToast(type === 'login' ? 'Logged in successfully' : 'Account created');
        } else {
            let msg = data.msg;
            if (data.errors) msg = data.errors.map(e => e.msg).join(', ');
            showToast(msg || 'Authentication failed', 'error');
        }
    } catch(err) {
        showToast('Server error', 'error');
    }
}

async function logout(e) {
    if(e) e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    localStorage.removeItem('user');
    currentUser = null;
    checkAuth();
}

// Sidebar logic
function attachGlobalListeners() {
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Nav Click Handling
    document.querySelectorAll('.nav-item[data-target]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(e.currentTarget.getAttribute('data-target'));
            if(window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('mobile-open');
            }
        });
    });

    // Sidebar Toggle
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if(window.innerWidth <= 768) {
            sidebar.classList.toggle('mobile-open');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });
    
    document.getElementById('sidebar-close').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('mobile-open');
    });

    // Modals
    
    document.getElementById('btn-add-employee').addEventListener('click', window.openEmployeeModal || openEmployeeModalOrig);
    document.getElementById('btn-add-department').addEventListener('click', openDepartmentModal);
    
document.getElementById('employee-modal-form').addEventListener('submit', saveEmployee);
    document.getElementById('department-modal-form').addEventListener('submit', saveDepartment);
    
    // View Toggles and Filters
    document.getElementById('emp-view-list').addEventListener('click', () => {
        empViewMode = 'list';
        document.getElementById('emp-view-list').classList.add('active');
        document.getElementById('emp-view-grid').classList.remove('active');
        loadEmployeesData();
    });
    document.getElementById('emp-view-grid').addEventListener('click', () => {
        empViewMode = 'grid';
        document.getElementById('emp-view-grid').classList.add('active');
        document.getElementById('emp-view-list').classList.remove('active');
        loadEmployeesData();
    });
    
    document.getElementById('dept-view-list').addEventListener('click', () => {
        deptViewMode = 'list';
        document.getElementById('dept-view-list').classList.add('active');
        document.getElementById('dept-view-grid').classList.remove('active');
        loadDepartmentsData();
    });
    document.getElementById('dept-view-grid').addEventListener('click', () => {
        deptViewMode = 'grid';
        document.getElementById('dept-view-grid').classList.add('active');
        document.getElementById('dept-view-list').classList.remove('active');
        loadDepartmentsData();
    });

    document.getElementById('employee-dept-filter').addEventListener('change', (e) => {
        currentEmpFilter = e.target.value;
        loadEmployeesData();
    });

    let searchTimeout;
    document.getElementById('employee-search').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentEmpSearch = e.target.value;
            loadEmployeesData();
        }, 300);
    });
}

// Data Fetchers
async function loadDashboardData() {
    try {
        const res = await fetch('/api/dashboard', { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        
        // Render KPIs
        document.getElementById('dashboard-kpis').innerHTML = `
            <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Total Employees</div>
                        <div class="kpi-value">${data.kpis.totalEmployees}</div>
                        <div class="kpi-trend">↗ <span>+12% from last month</span></div>
                    </div>
                    <div class="kpi-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                </div>
            </div>
            <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Departments</div>
                        <div class="kpi-value">${data.kpis.totalDepartments}</div>
                        <div class="kpi-trend">↗ <span>+2 from last month</span></div>
                    </div>
                    <div class="kpi-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg></div>
                </div>
            </div>
             <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Active Employees</div>
                        <div class="kpi-value">${data.kpis.activeEmployees}</div>
                        <div class="kpi-trend">↗ <span>98% from last month</span></div>
                    </div>
                    <div class="kpi-icon orange"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>
                </div>
            </div>
            <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Open Roles</div>
                        <div class="kpi-value">${data.kpis.openRoles}</div>
                        <div class="kpi-trend black-trend">↗ <span>+3 from last month</span></div>
                    </div>
                    <div class="kpi-icon gray"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
                </div>
            </div>
        `;

        // Render Activity Feed
        let acts = data.recentActivity.map(a => {
            const timeStr = new Date(a.createdAt).toLocaleDateString();
            return `
            <div class="activity-item">
                <div class="activity-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                <div class="activity-details">
                    <div class="activity-meta">
                        <span class="activity-badge blue-badge">${a.action}</span>
                        <span class="activity-time">${timeStr}</span>
                    </div>
                    <div class="activity-desc">${a.description}</div>
                    <div class="activity-user">by ${a.user}</div>
                </div>
            </div>`;
        }).join('');
        if(!acts) acts = '<p style="color:#64748b; font-size:14px;">No recent activity.</p>';
        document.getElementById('activity-feed').innerHTML = acts;

        // Load Department Overview silently in background to populate list
        const depRes = await fetch('/api/departments', { credentials: 'same-origin' });
        const depths = await depRes.json();
        
        let deptList = '';
        depths.slice(0,5).forEach(d => {
             deptList += `<li><div>${d.name}</div> <span class="dept-count">Multiple employees</span></li>`;
        });
        document.getElementById('dashboard-dept-list').innerHTML = deptList;

    } catch (err) {
        showToast('Error loading dashboard', 'error');
    }
}

let currentEmpSearch = '';
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
                    filterSelect.innerHTML += `<option value="${d._id}">${d.name}</option>`;
                });
            }
        }

        let url = '/api/employees?limit=100';
        if (currentEmpSearch) url += `&name=${encodeURIComponent(currentEmpSearch)}`;
        if (currentEmpFilter) url += `&department=${encodeURIComponent(currentEmpFilter)}`;

        const res = await fetch(url, { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Failed');
        const data = await res.json();
        
        const empTable = document.getElementById('employee-table-body');
        const empGrid = document.getElementById('employee-grid-container');
        document.getElementById('employee-count-label').innerHTML = `Showing ${data.employees.length} employees`;
        
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
            
            let actionsHtml = `<div class="action-btns">`;
            if (currentUser && currentUser.role === 'admin') {
                actionsHtml += `
                    <button class="action-btn" title="Copy Invite Link" onclick="navigator.clipboard.writeText(window.location.origin + '/app.html?invite=' + '${emp._id}'); showToast('Invitation link copied');"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>
                    <button class="action-btn" title="Toggle Status" onclick="toggleEmpStatus('${emp._id}', '${emp.status}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    <button class="action-btn" title="Edit Employee" onclick="editEmployee('${emp._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button class="action-btn" title="Delete Employee" onclick="deleteEmployee('${emp._id}')" style="color: #ef4444;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                `;
            } else {
                 actionsHtml += `<button class="action-btn" title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`;
            }
             actionsHtml += `</div>`;

            if (empViewMode === 'list') {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="emp-cell">
                        <div class="emp-avatar">${initials}</div>
                        <div class="emp-details">
                            <span class="emp-name">${escapeHtml(emp.name)} ${escapeHtml(emp.surname)}</span>
                            <span class="emp-phone">${escapeHtml(emp.phone || '+1 (555) 123-4567')}</span>
                        </div>
                    </td>
                    <td><span class="badge-dept">${escapeHtml(deptName)}</span></td>
                    <td>${escapeHtml(emp.role || 'Unassigned')}</td>
                    <td style="color:#64748b;">${escapeHtml(emp.email || `${escapeHtml(emp.name.toLowerCase())}.${escapeHtml(emp.surname.toLowerCase())}@company.com`)}</td>
                    <td><span class="badge-status">${escapeHtml(emp.status || 'active')}</span></td>
                    <td>${actionsHtml}</td>
                `;
                empTable.appendChild(tr);
            } else {
                const card = document.createElement('div');
                card.className = 'card dept-card';
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div class="emp-cell" style="margin-bottom: 0;">
                            <div class="emp-avatar">${initials}</div>
                            <div class="emp-details">
                                <span class="emp-name">${escapeHtml(emp.name)} ${escapeHtml(emp.surname)}</span>
                                <span class="emp-phone" style="color:#64748b; font-size:12px;">${escapeHtml(emp.role || 'Unassigned')}</span>
                            </div>
                        </div>
                        ${actionsHtml}
                    </div>
                    <div style="font-size:13px; color:#64748b; margin-bottom: 12px;">
                        <div>${escapeHtml(emp.email || `${escapeHtml(emp.name.toLowerCase())}.${escapeHtml(emp.surname.toLowerCase())}@company.com`)}</div>
                        <div style="margin-top: 4px;">${escapeHtml(emp.phone || '+1 (555) 123-4567')}</div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: auto;">
                        <span class="badge-dept">${escapeHtml(deptName)}</span>
                        <span class="badge-status">${escapeHtml(emp.status || 'active')}</span>
                    </div>
                `;
                empGrid.appendChild(card);
            }
        });

    } catch(e) {
        showToast('Error loading employees', 'error');
    }
}

let deptViewMode = 'grid';

async function loadDepartmentsData() {
     try {
        const res = await fetch('/api/departments', { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Failed');
        const data = await res.json();
        
        document.getElementById('departments-kpis').innerHTML = `
            <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Total Departments</div>
                        <div class="kpi-value">${data.length}</div>
                    </div>
                    <div class="kpi-icon gray"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                </div>
            </div>
            <!-- Mocked KPIs mimicking prototype -->
            <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Total Employees</div>
                        <div class="kpi-value">${window.cachedTotalEmployees || 0}</div>
                    </div>
                    <div class="kpi-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
                </div>
            </div>
             <div class="card kpi-card">
                <div class="kpi-header">
                    <div>
                        <div class="kpi-title">Avg Team Size</div>
                        <div class="kpi-value">${data.length ? Math.round((window.cachedTotalEmployees || 0) / data.length) : 0}</div>
                    </div>
                    <div class="kpi-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
                </div>
            </div>
        `;

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
            let actionsHtml = `<div class="action-btns">`;
            if (currentUser && currentUser.role === 'admin') {
                actionsHtml += `<button class="action-btn" title="Show/Hide" onclick="showToast('View Department action triggered')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`;
                actionsHtml += `<button class="action-btn" title="Edit" onclick="editDepartment('${dept._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>`;
                actionsHtml += `<button class="action-btn" title="Delete" onclick="deleteDepartment('${dept._id}')" style="color: #ef4444;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>`;
            } else {
                actionsHtml += `<button class="action-btn" title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`;
            }
            actionsHtml += `</div>`;
            
            if (deptViewMode === 'grid') {
                const card = document.createElement('div');
                card.className = 'card dept-card';
                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <h4>${escapeHtml(dept.name)}</h4>
                        ${actionsHtml}
                    </div>
                    <span class="dept-count">${escapeHtml(dept.manager ? dept.manager.name : 'Unassigned')}</span>
                    <p style="margin-top:12px;color:#64748b;">${escapeHtml(dept.description || '')}</p>
                `;
                deptGrid.appendChild(card);
            } else {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span style="font-weight: 500;">${escapeHtml(dept.name)}</span></td>
                    <td>${escapeHtml(dept.manager ? dept.manager.name : 'Unassigned')}</td>
                    <td>Multiple</td>
                    <td>$0.00</td>
                    <td><span class="badge-status">Active</span></td>
                    <td>${actionsHtml}</td>
                `;
                deptTable.appendChild(tr);
            }
        });

    } catch(e) {
        showToast('Error loading departments', 'error');
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// MODALS AND CRUD
async function populateDepartmentSelect() {
    try {
        const sel = document.getElementById('emp-department');
        sel.innerHTML = '<option value="">Loading...</option>';
        const res = await fetch('/api/departments', { credentials: 'same-origin' });
        const data = await res.json();
        sel.innerHTML = '<option value="">Select Department</option>';
        data.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d._id;
            opt.textContent = d.name;
            sel.appendChild(opt);
        });
    } catch(e) {}
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

async function openEmployeeModalOrig() {
    if(!currentUser || currentUser.role !== 'admin') return showToast('Admin access required', 'error');
    populateDepartmentSelect();
    document.getElementById('employee-modal-form').reset();
    document.getElementById('emp-id').value = '';
    document.getElementById('employee-modal-title').innerText = 'Add Employee';
    openModal('employee-modal');
}
function openDepartmentModal() {
    if(!currentUser || currentUser.role !== 'admin') return showToast('Admin access required', 'error');
    document.getElementById('department-modal-form').reset();
    document.getElementById('dept-id').value = '';
    document.getElementById('department-modal-title').innerText = 'New Department';
    openModal('department-modal');
}

async function saveEmployee(e) {
    e.preventDefault();
    const id = document.getElementById('emp-id').value;
    const body = {
        name: document.getElementById('emp-name').value,
        surname: document.getElementById('emp-surname').value,
        email: document.getElementById('emp-email').value,
        phone: document.getElementById('emp-phone').value,
        department: document.getElementById('emp-department').value,
        managerId: document.getElementById('emp-manager').value || null,
        role: document.getElementById('emp-role').value,
        status: document.getElementById('emp-status').value
    };
    
    // Auto-split name input if surname is empty and they typed a full name
    if (!body.surname && body.name.includes(' ')) {
       const parts = body.name.trim().split(' ');
       body.name = parts[0];
       body.surname = parts.slice(1).join(' ');
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/employees/${id}` : `/api/employees`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });
        
        if (res.ok) {
            closeModal('employee-modal');
            showToast(`Employee ${id ? 'updated' : 'added'}`);
            loadEmployeesData(); 
            if(currentView==='dashboard') loadDashboardData();
        } else {
            const err = await res.json();
            showToast(err.error?.message || 'Error occurred', 'error');
        }
    } catch(err) { showToast('Server Error', 'error'); }
}

async function deleteEmployee(id) {
    
    try {
        const res = await fetch(`/api/employees/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        if(res.ok) {
             showToast('Employee deleted');
             loadEmployeesData();
        } else showToast('Error deleting', 'error');
    } catch(err) { showToast('Server Error', 'error');}
}

async function saveDepartment(e) {
    e.preventDefault();
    const id = document.getElementById('dept-id').value;
    const body = {
        name: document.getElementById('dept-name').value,
        description: document.getElementById('dept-description').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/departments/${id}` : `/api/departments`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });
        
        if (res.ok) {
            closeModal('department-modal');
            showToast(`Department ${id ? 'updated' : 'added'}`);
            if(currentView==='dashboard') loadDashboardData();
            if(currentView==='departments') loadDepartmentsData();
        } else { showToast('Error occurred', 'error'); }
    } catch(err) { showToast('Server Error', 'error'); }
}


// --- PROFILE ---
async function loadProfileData() {
    try {
        const res = await fetch('/api/employees/me', { credentials: 'same-origin' });
        if(!res.ok) {
            if(res.status === 404) {
               if (currentUser && currentUser.role === 'admin') {
                   document.getElementById('profile-dept-info').innerHTML = 
                       `Your Role: <strong>Administrator</strong> | System Owner`;
                   return;
               }
               document.getElementById('profile-dept-info').innerHTML = '<p style="color:red;">Error: Your profile has not been assigned to a valid employee record. Please contact your admin.</p>';
               return;
            }
            throw new Error('Failed');
        }
        const data = await res.json();
        
        document.getElementById('profile-phone').value = data.phone || '';
        document.getElementById('profile-address').value = data.address || '';
                const emC = data.emergencyContact || '';
        const emParts = emC.split(' - ');
        const elName = document.getElementById('profile-emergency-name');
        const elPhone = document.getElementById('profile-emergency-phone');
        if (elName) elName.value = emParts[0] || '';
        if (elPhone) elPhone.value = emParts[1] || '';
        
        document.getElementById('profile-dept-info').innerHTML = 
            `Your Role: <strong>${data.role || 'Unassigned'}</strong> | Department: ${data.department ? data.department.name : 'None'}`;
            
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
        emergencyContact: document.getElementById('profile-emergency-name').value + (document.getElementById('profile-emergency-phone').value ? " - " + document.getElementById('profile-emergency-phone').value : "")
    };
    
    try {
        const res = await fetch('/api/employees/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(body)
        });
        if(res.ok) showToast('Profile updated');
        else {
            const err = await res.json();
            showToast(err.msg || 'Error updating profile', 'error');
        }
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
        
        if (isAdmin) {
            document.getElementById('leave-action-header').style.display = 'table-cell';
            const btn = document.getElementById('btn-request-leave');
            if(btn) btn.style.display = 'none';
        }

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
                actions = `
                <td>
                    <button class="btn btn-dark" style="padding:4px 8px; font-size:12px; margin-right:5px;" onclick="updateLeave('${req._id}', 'Approved')">Approve</button>
                    <button class="btn" style="padding:4px 8px; font-size:12px; background: #ef4444; color:white; border:none; border-radius:4px; cursor:pointer;" onclick="updateLeave('${req._id}', 'Denied')">Deny</button>
                </td>`;
            } else if (isAdmin) {
                 actions = '<td></td>';
            }

            tr.innerHTML = `
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(req.type)}</td>
                <td>${start}</td>
                <td>${end}</td>
                <td><span class="${classStatus}">${escapeHtml(req.status)}</span></td>
                ${actions}
            `;
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
    
    try {
        const res = await fetch(`/api/leave-requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ status })
        });
        if(res.ok) {
             showToast(`Leave ${status}`);
             loadLeavesData();
        } else showToast('Error updating', 'error');
    } catch(err) { showToast('Server Error', 'error');}
}


// === Phase 3 / Enterprise Features UI ===

async function fetchEmployeesList() {
    try {
        const res = await fetch('/api/employees');
        if (!res.ok) return [];
        const data = await res.json();
        return data.employees || data || [];
    } catch {
        return [];
    }
}

async function populateManagerSelect() {
    const mgrSelect = document.getElementById('emp-manager');
    if(!mgrSelect) return;
    mgrSelect.innerHTML = '<option value="">None</option>';
    let employees = await fetchEmployeesList();
    if (!Array.isArray(employees)) employees = [];
    employees.forEach(emp => {
        mgrSelect.innerHTML += `<option value="${emp._id}">${emp.name} ${emp.surname}</option>`;
    });
}

// Intercept openEmployeeModal
const originalOpenEmployeeModal = window.openEmployeeModal || function(){};
window.openEmployeeModal = async function() {
    if(!currentUser || currentUser.role !== 'admin') return showToast('Admin access required', 'error');
    try {
        await populateDepartmentSelect();
    } catch(err) { console.error('Error populating departments:', err); }
    try {
        await populateManagerSelect();
    } catch(err) { console.error('Error populating managers:', err); }
    document.getElementById('employee-modal-form').reset();
    document.getElementById('emp-id').value = '';
    document.getElementById('employee-modal-title').innerText = 'Add Employee';
    openModal('employee-modal');
};

async function editEmployee(id) {
    try {
        const res = await fetch(`/api/employees/${id}`);
        if (!res.ok) throw new Error('Error fetching employee');
        const emp = await res.json();
        
        await populateDepartmentSelect();
        await populateManagerSelect();
        
        document.getElementById('emp-id').value = emp._id;
        document.getElementById('emp-name').value = emp.name || '';
        document.getElementById('emp-surname').value = emp.surname || '';
        document.getElementById('emp-email').value = emp.email || '';
        document.getElementById('emp-phone').value = emp.phone || '';
        document.getElementById('emp-department').value = emp.department ? emp.department._id : '';
        document.getElementById('emp-manager').value = emp.managerId || '';
        document.getElementById('emp-role').value = emp.position || '';
        document.getElementById('emp-status').value = emp.status || 'active';
        
        document.getElementById('employee-modal-title').innerText = 'Edit Employee';
        openModal('employee-modal');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Docs
async function initDocumentsPage() {
    const select = document.getElementById('doc-employee');
    const employees = await fetchEmployeesList();
    select.innerHTML = '<option value="">Select Employee...</option>';
    employees.forEach(emp => {
        select.innerHTML += `<option value="${emp._id}">${emp.name} ${emp.surname}</option>`;
    });
    select.onchange = loadDocuments;

    document.getElementById('document-upload-form').onsubmit = handleDocUpload;
}

async function loadDocuments() {
    const tbody = document.getElementById('documents-table-body');
    const empId = document.getElementById('doc-employee').value;
    if (!empId) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Select an employee above to view their documents.</td></tr>';
        return;
    }

    try {
        const res = await fetch(`/api/documents/${empId}`);
        const docs = await res.json();
        
        if (!docs || docs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No documents found.</td></tr>';
            return;
        }

        tbody.innerHTML = docs.map(doc => `
            <tr>
                <td>${doc.name}</td>
                <td>${doc.employeeId}</td>
                <td>${new Date(doc.createdAt).toLocaleDateString()}</td>
                <td><a href="${doc.fileUrl}" target="_blank" class="btn btn-outline" style="padding: 2px 8px; font-size: 12px; text-decoration: none;">Download</a></td>
            </tr>
        `).join('');
    } catch(err) {
        showToast('Error loading documents');
    }
}

async function handleDocUpload(e) {
    e.preventDefault();
    const file = document.getElementById('doc-file').files[0];
    const name = document.getElementById('doc-name').value;
    const empId = document.getElementById('doc-employee').value;

    if (!empId) return showToast('Please select an employee first', 'error');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', name);
    formData.append('employeeId', empId);

    try {
        const res = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData
        });
        if(res.ok) {
            showToast('Document uploaded!');
            document.getElementById('doc-file').value = '';
            document.getElementById('doc-name').value = '';
            loadDocuments();
        } else {
            showToast('Upload failed', 'error');
        }
    } catch(err) {
        showToast('Error uploading document', 'error');
    }
}

// Org Chart Simple Renderer (Using indented lists for simplicity without importing external libs)
async function loadOrgChart() {
    const container = document.getElementById('org-chart-container');
    container.innerHTML = '<div>Loading...</div>';
    
    try {
        const res = await fetch('/api/admin/org-tree');
        if(!res.ok) throw new Error('Could not load org tree');
        const tree = await res.json();
        
        if(!tree || tree.length === 0) {
            container.innerHTML = '<p>No organizational structure found. Assign managers to employees.</p>';
            return;
        }

        const renderNode = (node) => {
            return `
                <div style="margin-left: 20px; border-left: 2px solid var(--border-color); padding-left: 10px; margin-bottom: 10px;">
                    <div style="background: var(--bg-surface); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); display: inline-block; min-width: 200px;">
                        <strong>${node.name}</strong>
                        <div style="font-size: 0.85em; color: var(--text-secondary);">${node.position || 'Employee'}</div>
                    </div>
                    ${node.children && node.children.length > 0 ? node.children.map(renderNode).join('') : ''}
                </div>
            `;
        };

        container.innerHTML = `<div style="text-align: left; padding: 20px;">${tree.map(renderNode).join('')}</div>`;
    } catch (err) {
        container.innerHTML = '<p>Error loading or you lack admin permissions.</p>';
    }
}

window.toggleEmpStatus = async function(id, currentStatus) {
    const newStatus = (currentStatus === 'active') ? 'inactive' : 'active';
    try {
        const res = await fetch(`/api/employees/${id}/status`, { 
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


window.deleteDepartment = function(id) {
    window.pendingDeleteAction = async () => {
        try {
            const res = await fetch(`/api/departments/${id}`, { method: 'DELETE', credentials: 'same-origin' });
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


window.editDepartment = async function(id) {
    try {
        const res = await fetch(`/api/departments/${id}`, { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Error fetching department');
        const dept = await res.json();
        document.getElementById('dept-id').value = dept._id;
        document.getElementById('dept-name').value = dept.name;
        document.getElementById('dept-description').value = dept.description || '';
        document.getElementById('department-modal-title').innerText = 'Edit Department';
        openModal('department-modal');
    } catch(e) { showToast('Error fetching department', 'error'); }
};

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
                    <label>Full Name</label>
                    <input type="text" id="auth-name" placeholder="John Doe" required>
                </div>
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
        body.name = document.getElementById('auth-name').value;
        const nameParts = body.name.split(' ');
        if(nameParts.length < 2) return showToast('Please enter both name and surname', 'error');
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
    document.getElementById('employee-modal-form').addEventListener('submit', saveEmployee);
    document.getElementById('department-modal-form').addEventListener('submit', saveDepartment);
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

async function loadEmployeesData() {
    try {
        const res = await fetch('/api/employees', { credentials: 'same-origin' });
        if(!res.ok) throw new Error('Failed');
        const data = await res.json();
        
        const empTable = document.getElementById('employee-table-body');
        document.getElementById('employee-count-label').innerHTML = `Showing ${data.employees.length} of ${data.total} employees`;
        empTable.innerHTML = '';
        
        data.employees.forEach(emp => {
            const deptName = emp.department ? emp.department.name : 'Unassigned';
            const initials = emp.name[0].toUpperCase() + emp.surname[0].toUpperCase();
            
            // Build the row elements dynamically
            const tr = document.createElement('tr');
            
            let actionsHtml = `<div class="action-btns">`;
            if (currentUser && currentUser.role === 'admin') {
                actionsHtml += `
                    <button class="action-btn" title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    <button class="action-btn" title="Edit Employee" onclick="editEmployee('${emp._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                `;
            } else {
                 actionsHtml += `<button class="action-btn" title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`;
            }
             actionsHtml += `</div>`;

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
        });

    } catch(e) {
        showToast('Error loading employees', 'error');
    }
}

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
        `;

        document.getElementById('departments-grid').innerHTML = '';
        data.forEach(dept => {
            const card = document.createElement('div');
            card.className = 'card dept-card';
            card.innerHTML = `
                <h4>${escapeHtml(dept.name)}</h4>
                <span class="dept-count">Multiple Employees</span>
                <p>${escapeHtml(dept.description || 'Software development and infrastructure')}</p>
            `;
            document.getElementById('departments-grid').appendChild(card);
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

function openEmployeeModal() {
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
    if(!confirm("Are you sure you want to delete this employee?")) return;
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

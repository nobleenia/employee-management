const fs = require('fs');
const content = fs.readFileSync('public/script.js', 'utf8');

const attachStart = content.indexOf('function attachGlobalListeners() {');
const attachEnd = content.indexOf('// Data Fetchers', attachStart);

const newAttach = `function attachGlobalListeners() {
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

`;

fs.writeFileSync('public/script.js', content.slice(0, attachStart) + newAttach + content.slice(attachEnd));

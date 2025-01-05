// Fetch and display departments
async function fetchDepartments() {
  const res = await fetch('/api/departments');
  const departments = await res.json();

  const departmentList = document.getElementById('department-list');
  const departmentSelect = document.getElementById('employee-department');

  departmentList.innerHTML = '';
  departmentSelect.innerHTML = '';

  departments.forEach(department => {
    // Add to list
    const li = document.createElement('li');
    li.textContent = department.name;
    departmentList.appendChild(li);

    // Add to dropdown
    const option = document.createElement('option');
    option.value = department._id;
    option.textContent = department.name;
    departmentSelect.appendChild(option);
  });
}

// Fetch an ddisplay employees
async function fetchEmployees() {
  const res = await fetch('/api/employees');
  const employees = await res.json();

  const employeeTable = document.getElementById('employee-table');
  employeeTable.innerHTML = '';

  employees.forEach(employee => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${employee.name}</td>
      <td>${employee.surname}</td>
      <td>${employee.department.name}</td>
      <td>
        <button onclick="deleteEmployee('${employee._id}')">Delete</button>
      </td>
    `;

    employeeTable.appendChild(row);
  });
}

// Add department
document.getElementById('department-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('department-name').value;

  await fetch('/api/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  document.getElementById('department-name').value = '';
  fetchDepartments();
});

// Add employee
document.getElementById('employee-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('employee-name').value;
  const surname = document.getElementById('employee-surname').value;
  const department = document.getElementById('employee-department').value;

  await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, surname, department }),
  });

  document.getElementById('employee-name').value = '';
  document.getElementById('employee-surname').value = '';
  fetchEmployees();
});

// Delete employee
async function deleteEmployee(id) {
  await fetch(`/api/employees/${id}`, { method: 'DELETE' });
  fetchEmployees();
}

// Initialize frontend
document.addEventListener('DOMContentLoaded', () => {
  fetchDepartments();
  fetchEmployees();
});

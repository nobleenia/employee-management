let authToken = null; // To store the JWT token

// Handle registration
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      alert('Registration successful. Please log in.');
    } else {
      const error = await res.json();
      alert(`Registration failed: ${error.msg || error.errors[0].msg}`);
    }
  } catch (err) {
    console.error('Error during registration:', err);
    alert('Something went wrong during registration.');
  }
});

// Handle login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      authToken = data.token; // Store the token
      localStorage.setItem('authToken', authToken); // Save token for persistence
      alert('Login successful.');
      document.getElementById('logout-button').style.display = 'block'; // Show logout button
      fetchEmployees(); // Fetch employees after login
    } else {
      const error = await res.json();
      alert(`Login failed: ${error.msg || error.errors[0].msg}`);
    }
  } catch (err) {
    console.error('Error during login:', err);
    alert('Something went wrong during login.');
  }
});

// Handle logout
document.getElementById('logout-button').addEventListener('click', () => {
  authToken = null; // Clear token in memory
  localStorage.removeItem('authToken'); // Clear token from localStorage
  alert('You have been logged out.');
  location.reload(); // Reload the page to reset UI
});

// Fetch and display employees (with token)
async function fetchEmployees() {
  const token = authToken || localStorage.getItem('authToken'); // Get token from memory or storage

  if (!token) {
    alert('Please log in to view employees.');
    return;
  }

  try {
    const res = await fetch('/api/employees', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const employees = await res.json();

      const employeeTable = document.getElementById('employee-table');
      employeeTable.innerHTML = '';

      employees.forEach((employee) => {
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
    } else {
      alert('Failed to fetch employees. Please ensure you are logged in.');
    }
  } catch (err) {
    console.error('Error fetching employees:', err);
    alert('Something went wrong while fetching employees.');
  }
}

// Fetch and display departments
async function fetchDepartments() {
  try {
    const res = await fetch('/api/departments');
    const departments = await res.json();

    const departmentList = document.getElementById('department-list');
    const departmentSelect = document.getElementById('employee-department');

    departmentList.innerHTML = '';
    departmentSelect.innerHTML = '';

    departments.forEach((department) => {
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
  } catch (err) {
    console.error('Error fetching departments:', err);
    alert('Something went wrong while fetching departments.');
  }
}

// Add a new department
document.getElementById('department-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('department-name').value;
  const token = authToken || localStorage.getItem('authToken'); // Get the token from memory or storage

  if (!token) {
    alert('Please log in to add a department.');
    return;
  }

  try {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include token for protected routes
      },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      document.getElementById('department-name').value = ''; // Clear input field
      alert('Department added successfully!');
      fetchDepartments(); // Refresh department list
    } else {
      const error = await res.json();
      alert(`Failed to add department: ${error.msg || error.errors[0].msg}`);
    }
  } catch (err) {
    console.error('Error adding department:', err);
    alert('Something went wrong while adding the department.');
  }
});

// Add a new employee
document.getElementById('employee-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('employee-name').value;
  const surname = document.getElementById('employee-surname').value;
  const department = document.getElementById('employee-department').value;
  const token = authToken || localStorage.getItem('authToken'); // Get the token from memory or storage

  if (!token) {
    alert('Please log in to add an employee.');
    return;
  }

  try {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include token for protected routes
      },
      body: JSON.stringify({ name, surname, department }),
    });

    if (res.ok) {
      document.getElementById('employee-name').value = ''; // Clear input fields
      document.getElementById('employee-surname').value = '';
      alert('Employee added successfully!');
      fetchEmployees(); // Refresh employee list
    } else {
      const error = await res.json();
      alert(`Failed to add employee: ${error.msg || error.errors[0].msg}`);
    }
  } catch (err) {
    console.error('Error adding employee:', err);
    alert('Something went wrong while adding the employee.');
  }
});

// Delete employee
async function deleteEmployee(id) {
  const token = authToken || localStorage.getItem('authToken');

  if (!token) {
    alert('Please log in to delete an employee.');
    return;
  }

  try {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.ok) {
      fetchEmployees();
    } else {
      alert('Failed to delete employee.');
    }
  } catch (err) {
    console.error('Error deleting employee:', err);
    alert('Something went wrong while deleting an employee.');
  }
}

// Initialize frontend
document.addEventListener('DOMContentLoaded', () => {
  authToken = localStorage.getItem('authToken'); // Restore token from localStorage
  if (authToken) {
    document.getElementById('logout-button').style.display = 'block'; // Show logout button
  }
  fetchDepartments();
  fetchEmployees();
});

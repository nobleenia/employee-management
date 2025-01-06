let authToken = null; // To store the JWT token
let userName = null; // To store the logged-in user's name
let userRole = null; // To store the logged-in user's role

// Show modal when "Register/Login" button is clicked
document.getElementById('auth-button').addEventListener('click', () => {
  document.getElementById('auth-modal').style.display = 'block';
});

// Hide modal on successful login or when closing
function hideAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

// Show Notifications
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;

  // Apply a background color based on the type of message
  if (type === 'success') {
    notification.style.backgroundColor = '#28a745'; // Green for success
  } else if (type === 'error') {
    notification.style.backgroundColor = '#dc3545'; // Red for errors
  } else {
    notification.style.backgroundColor = '#333'; // Default (info)
  }

  // Show the notification
  notification.classList.remove('hidden');
  notification.classList.add('show');

  // Hide the notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    notification.classList.add('hidden');
  }, 3000);
}

// Close modal when clicking outside of the modal content
window.addEventListener('click', (e) => {
  const modal = document.getElementById('auth-modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Switch to Register Form
document.getElementById('switch-to-register').addEventListener('click', () => {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('auth-title').textContent = 'Register';
});

// Switch to Login Form
document.getElementById('switch-to-login').addEventListener('click', () => {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('auth-title').textContent = 'Login';
});

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
      showNotification('Registration successful. Please log in.');
      document.getElementById('register-form').reset();
      document.getElementById('switch-to-login').click(); // Switch to login form
    } else {
      const error = await res.json();
      showNotification(`Registration failed: ${error.msg || error.errors[0].msg}`);
    }
  } catch (err) {
    console.error('Error during registration:', err);
    showNotification('Something went wrong during registration.');
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
      // Decode token to get user role
      const decodedToken = JSON.parse(atob(authToken.split('.')[1])); // Decode JWT payload
      userName = decodedToken.name;
      userRole = decodedToken.role;
      localStorage.setItem('userName', userName);
      localStorage.setItem('userRole', userRole);

      showNotification('Login successful.');

      hideAuthModal();
      setupUIBasedOnRole(userRole);
      document.getElementById('auth-button').style.display = 'none'; // Hide Register/Login button
      document.getElementById('logout-button').style.display = 'block'; // Show Logout button
      document.getElementById('welcome-section').style.display = 'block'; // Show Welcome section
      document.getElementById('welcome-message').textContent = `Welcome, ${userName}`;
      document.getElementById('departments').style.display = 'block'; // Show Departments section
      document.getElementById('employees').style.display = 'block'; // Show Employees section

      fetchEmployees();
      fetchDepartments();
    } else {
      const error = await res.json();
      showNotification(`Login failed: ${error.msg || error.errors[0].msg}`);
    }
  } catch (err) {
    console.error('Error during login:', err);
    showNotification('Something went wrong during login.');
  }
});

// Handle logout
document.getElementById('logout-button').addEventListener('click', () => {
  authToken = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('userName');
  showNotification('You have been logged out.');
  location.reload();
});

// Adjust UI based on role
function setupUIBasedOnRole(role) {
  if (role === 'admin') {
    // Admin: Show all buttons
    document.querySelectorAll('.admin-only').forEach((el) => (el.style.display = 'block'));
  } else {
    // User: Hide admin-only buttons
    document.querySelectorAll('.admin-only').forEach((el) => (el.style.display = 'none'));
  }
}

// Fetch and display employees (with token)
async function fetchEmployees() {
  const token = authToken || localStorage.getItem('authToken');

  if (!token) {
    showNotification('Please log in to view employees.');
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
      showNotification('Failed to fetch employees. Please ensure you are logged in.');
    }
  } catch (err) {
    console.error('Error fetching employees:', err);
    showNotification('Something went wrong while fetching employees.');
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
    showNotification('Something went wrong while fetching departments.');
  }
}

// Add a new department
document.getElementById('department-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('department-name').value;
  const token = authToken || localStorage.getItem('authToken');

  if (!token) {
    showNotification('Please log in to add a department.');
    return;
  }

  try {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      document.getElementById('department-name').value = '';
      showNotification('Department added successfully!');
      fetchDepartments();
    } else {
      const error = await res.json();
      showNotification(`Failed to add department: ${error.msg || error.errors[0].msg}`);
    }
  } catch (err) {
    console.error('Error adding department:', err);
    showNotification('Something went wrong while adding the department.');
  }
});

// Add a new employee
document.getElementById('employee-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('employee-name').value;
  const surname = document.getElementById('employee-surname').value;
  const department = document.getElementById('employee-department').value;
  const token = authToken || localStorage.getItem('authToken');

  if (!token) {
    showNotification('Please log in to add an employee.');
    return;
  }

  try {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, surname, department }),
    });

    if (res.ok) {
      document.getElementById('employee-name').value = '';
      document.getElementById('employee-surname').value = '';
      showNotification('Employee added successfully!');
      fetchEmployees();
    } else {
      const error = await res.json();
      showNotification(`Failed to add employee: ${error.msg || error.errors[0].msg}`);
    }
  } catch (err) {
    console.error('Error adding employee:', err);
    showNotification('Something went wrong while adding the employee.');
  }
});

// Delete employee
async function deleteEmployee(id) {
  const token = authToken || localStorage.getItem('authToken');

  if (!token) {
    showNotification('Please log in to delete an employee.');
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
      showNotification('Failed to delete employee.');
    }
  } catch (err) {
    console.error('Error deleting employee:', err);
    showNotification('Something went wrong while deleting an employee.');
  }
}

// Initialize frontend
document.addEventListener('DOMContentLoaded', () => {
  authToken = localStorage.getItem('authToken'); // Restore token from localStorage
  userName = localStorage.getItem('userName'); // Restore user name

  if (authToken) {
    document.getElementById('auth-button').style.display = 'none'; // Hide Register/Login button
    document.getElementById('logout-button').style.display = 'block'; // Show Logout button
    document.getElementById('welcome-section').style.display = 'block'; // Show Welcome section
    document.getElementById('welcome-message').textContent = `Welcome, ${userName}`; // Show Welcome message
    document.getElementById('departments').style.display = 'block'; // Show Departments section
    document.getElementById('employees').style.display = 'block'; // Show Employees section

    fetchEmployees();
    fetchDepartments();
  }
});

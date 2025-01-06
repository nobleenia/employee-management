# Employee Management System

A full-stack **CRUD Employee Management System** with authentication, role-based access control, and modern frontend features. The app is designed to manage employees and departments for a company, allowing **Admins** to create, edit, and delete records while **Users** can view the data.

---

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Project Structure](#project-structure)
4. [Installation and Setup](#installation-and-setup)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)
7. [Role-Based Access](#role-based-access)
8. [Frontend Features](#frontend-features)
9. [Dockerization and Deployment](#dockerization-and-deployment)
10. [Screenshots](#screenshots)
11. [Future Enhancements](#future-enhancements)

---

## Features

### Backend
- **Authentication**: Users can register and log in using JWT-based authentication.
- **Role-Based Access**: 
  - **Admins**: Can add, update, delete employees and departments.
  - **Users**: Can only view data (read-only access).
- **CRUD Operations**: Full Create, Read, Update, and Delete functionalities for employees and departments.
- **Data Validation**: Ensures valid inputs during registration and CRUD operations.

### Frontend
- Modern UI with:
  - **Login/Registration Popup**: Simplified and user-friendly authentication.
  - **Admin vs User Views**: Admin features are restricted from normal users.
- **Dynamic Notifications**: Real-time popups for success and error messages.
- **Token-Based Authorization**: Role-based visibility for frontend components.

---

## Technologies Used

### Backend
- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Fast and minimalist web framework.
- **MongoDB**: NoSQL database to store employee and department data.
- **Mongoose**: ODM for MongoDB.
- **JWT**: JSON Web Token for authentication and authorization.
- **Bcrypt.js**: Secure password hashing.

### Frontend
- **HTML/CSS**: Responsive design with clean styling.
- **Vanilla JavaScript**: Interactive user interface.

### DevOps & Deployment
- **Docker**: Containerized application.
- **Docker Compose**: Multi-container orchestration.
- **Nginx** (Optional): Reverse proxy for deployment.
- **GitHub**: Version control.
- **Heroku / AWS / DigitalOcean**: Deployment options.

---

## Project Structure
employee-management/
├── models/ # Mongoose schemas for Users, Employees, Departments
│  
├── routes/ # Express routes for APIs (auth, employees, departments)
│  
├── public/ # Static frontend files (HTML, CSS, JS)
│   │  
│   ├── index.html # Main frontend HTML  
│   │  
│   ├── styles.css # CSS for the frontend  
│   │ 
│   └── script.js # JavaScript for the frontend  
│ 
├── middleware/ # Custom middleware for auth and role-based access  
│  
├── docker-compose.yml # Docker configuration for multi-container setup
│ 
├── Dockerfile # Dockerfile for app container
│  
├── server.js # Main Express app entry point
│ 
├── package.json # Dependencies and scripts  
│ 
└── README.md # Documentation



## Installation and Setup

### Prerequisites
- Install **Node.js** (v18+), **npm**, and **Docker**.

### Clone Repository
```bash
git clone <repository-url>
cd employee-management```

### Install Dependencies
```bash
npm install```

### Environment Variables
Create a .env file in the root directory and configure the following variables:
```makefile
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/employeeManagement?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=your_super_secret_key```

## Running the Application
### Locally

1. Start MongoDB:  
```bash
mongod```

2. Start the server:  
```bash
npm start```

3. Open the app in the browser:  
```bash
http://localhost:3000```

### Using Docker

1. Build and start containers:
```bash
docker-compose up --build -d```

2. Access the app:
```bash
http://localhost:3000```

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register a new user.
- **POST** `/api/auth/login` - Log in a user.
- **PUT** `/api/auth/make-admin/:id` - Assign admin role (admin only).

### Employees
- **GET** `/api/employees` - Fetch all employees.
- **POST** `/api/employees` - Add a new employee (admin only).
- **PUT** `/api/employees/:id` - Update employee details (admin only).
- **DELETE** `/api/employees/:id` - Delete an employee (admin only).

### Departments
- **GET** `/api/departments` - Fetch all departments.
- **POST** `/api/departments` - Add a new department (admin only).
- **PUT** `/api/departments/:id` - Update department details (admin only).
- **DELETE** `/api/departments/:id` - Delete a department (admin only).

---

## Role-Based Access

## Admins:
- Access all CRUD operations for employees and departments.
- Can promote other users to admins.

### Users:
- View-only access to employees and departments.

---

## Frontend Features

- **Authentication**: Users log in to access protected routes.
- **Dynamic Content**: The UI dynamically adapts based on user roles.
- **Notifications**: Real-time feedback for actions.
- **Popup Login/Register**: Simplified authentication flow.

---

## Dockerization and Deployment

### Docker Workflow
#### Build and Run Containers:
```bash
docker-compose up --build -d

#### Push to Docker Hub:
```bash
docker build -t <dockerhub-username>/employee-management .
docker push <dockerhub-username>/employee-management


## Deployment Options
### Heroku:
Push code and configure .env variables.

### AWS/DigitalOcean:
Set up Docker containers or use Kubernetes for scaling.

## Future Enhancements
1. Advanced Filters:
- Add search and filter options for employees.

2. Pagination:
- Support large datasets efficiently.

3. Audit Logs:
- Track user actions for security.

4. Email Notifications:
- Send notifications for new registrations or updates.

## License
This project is licensed under the MIT License. Feel free to use, modify, and distribute.
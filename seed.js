const mongoose = require('mongoose');
const Department = require('./models/Department');
const Employee = require('./models/Employee');

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Department.deleteMany({});
    await Employee.deleteMany({});

    // Create Departments
    const departments = await Department.insertMany([
      { name: 'General Dentistry' },
      { name: 'Pediatric Dentistry' },
      { name: 'Restorative Dentistry' },
      { name: 'Surgery' },
      { name: 'Orthodontics' },
    ]);

    // Create Employees
    await Employee.insertMany([
      { name: 'Alfred', surname: 'Christensen', department: departments[0]._id },
      { name: 'John', surname: 'Dudley', department: departments[0]._id },
      { name: 'Janet', surname: 'Doe', department: departments[0]._id },
      { name: 'Francisco', surname: 'Willard', department: departments[1]._id },
      { name: 'Sarah', surname: 'Alvarez', department: departments[1]._id },
      { name: 'Lisa', surname: 'Harris', department: departments[2]._id },
      { name: 'Danny', surname: 'Perez', department: departments[2]._id },
      { name: 'Constance', surname: 'Smith', department: departments[3]._id },
      { name: 'Leslie', surname: 'Roche', department: departments[4]._id },
    ]);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding the database:', err);
    process.exit(1);
  }
};

seedDatabase();

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Organization = require('./models/Organization');
const User = require('./models/User');
const Department = require('./models/Department');
const Employee = require('./models/Employee');
const ChecklistTemplate = require('./models/ChecklistTemplate');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/employee-management';

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clean DB
    await Promise.all([
      Organization.deleteMany(),
      User.deleteMany(),
      Department.deleteMany(),
      Employee.deleteMany(),
      ChecklistTemplate.deleteMany()
    ]);
    console.log('Cleared existing data.');

    // 1. Create admin user's details
    const email = 'admin@acme.com';
    const password = 'password123';
    const name = email.split('@')[0];

    // 2. Create the User outline to get the ownerId
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    // 3. Create the Organization
    const organization = new Organization({
      name: `Acme Corp Workspace`,
      ownerId: adminUser._id
    });
    await organization.save();

    // 4. Update the user with the organizationId & save
    adminUser.organizationId = organization._id;
    // We already hashed password so we should bypass save hook if we could, 
    // but the pre save hashes it again if modified. It counts as modified since it's a new doc.
    // Instead we can just save plain text and let the hook hash it!
    
    const adminUser2 = new User({
        name, email, password, role: 'admin', organizationId: organization._id
    });
    await adminUser2.save();

    const orgId = organization._id;

    // 5. Create Departments
    const engineering = await Department.create({ name: 'Engineering', description: 'Tech Team', organizationId: orgId });
    const hr = await Department.create({ name: 'Human Resources', description: 'People Team', organizationId: orgId });

    // 6. Create Employees
    const manager = await Employee.create({
      name: 'Alice',
      surname: 'Smith',
      email: 'alice.smith@acme.com',
      phone: '555-1234',
      position: 'Engineering Manager',
      status: 'active',
      department: engineering._id,
      organizationId: orgId
    });

    await Employee.create({
      name: 'Bob',
      surname: 'Jones',
      email: 'bob.j@acme.com',
      phone: '555-4321',
      position: 'Software Engineer',
      status: 'active',
      department: engineering._id,
      managerId: manager._id,
      organizationId: orgId
    });

    await Employee.create({
      name: 'Carol',
      surname: 'White',
      email: 'carol.w@acme.com',
      phone: '555-8765',
      position: 'HR Specialist',
      status: 'active',
      department: hr._id,
      organizationId: orgId
    });

    // 7. Checklists
    await ChecklistTemplate.create({
      name: 'Standard IT Onboarding',
      type: 'Onboarding',
      tasks: ['Issue Mac', 'Create Email', 'Slack Invite', '101 Security Training'],
      organizationId: orgId
    });

    console.log('Database seeded successfully!');
    console.log('==============================================');
    console.log(`ADMIN LOGIN FOR Acme Corp`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('==============================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed', error);
    process.exit(1);
  }
}

seedDB();

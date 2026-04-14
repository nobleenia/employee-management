const fs = require('fs');

let empRoutes = fs.readFileSync('routes/employees.js', 'utf8');
empRoutes = empRoutes.replace(
    `const employee = await Employee.findOneAndUpdate(
      { userId: req.user.id, organizationId: req.user.organizationId },
      { phone, address, emergencyContact },
      { new: true }
    ).populate('department', 'name');`,
    `let employee = await Employee.findOneAndUpdate(
      { userId: req.user.id, organizationId: req.user.organizationId },
      { phone, address, emergencyContact },
      { new: true }
    ).populate('department', 'name');
    
    // If Admin/User does not have an employee profile yet, create one
    if (!employee && req.user) {
        employee = new Employee({
            userId: req.user.id,
            organizationId: req.user.organizationId,
            name: req.user.name || 'User',
            surname: '',
            email: req.user.email || \`\${req.user.name}@example.com\`,
            phone: phone || '',
            address: address || '',
            emergencyContact: emergencyContact || '',
            role: req.user.role === 'admin' ? 'Manager' : 'Employee'
        });
        await employee.save();
    }`
);
fs.writeFileSync('routes/employees.js', empRoutes);

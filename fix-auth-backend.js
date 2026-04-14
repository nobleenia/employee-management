const fs = require('fs');
let authRoute = fs.readFileSync('routes/auth.js', 'utf8');

if(!authRoute.includes("const Employee = require('../models/Employee');")) {
    authRoute = authRoute.replace(
        "const User = require('../models/User');",
        "const User = require('../models/User');\nconst Employee = require('../models/Employee');"
    );
}

const registerLogicTarget = "    const { email, password } = req.body;";
const registerLogicReplacement = `    const { email, password, inviteId } = req.body;`;

if(authRoute.includes(registerLogicTarget)) {
    authRoute = authRoute.replace(registerLogicTarget, registerLogicReplacement);
}

const tryTarget = "    try {\n      // Check if user already exists";
const tryReplace = `    try {
      if (inviteId) {
        const employee = await Employee.findById(inviteId);
        if (!employee) return res.status(400).json({ msg: 'Invalid invitation link' });
        if (employee.userId) return res.status(400).json({ msg: 'Invitation already used' });

        const userEmail = employee.email || email;

        // Check if user already exists
        let user = await User.findOne({ email: userEmail });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({
          name: employee.name,
          email: userEmail,
          password,
          role: 'user', // Invited employees join as regular users
          organizationId: employee.organizationId
        });
        await user.save();

        employee.userId = user._id;
        await employee.save();

        const token = jwt.sign(
          { id: user.id, name: user.name, role: user.role, organizationId: employee.organizationId },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1h' }
        );

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000 
        });

        return res.json({ msg: 'Registration successful', user: { name: user.name, role: user.role, organizationId: user.organizationId } });
      }

      // Check if user already exists`;

if(authRoute.includes(tryTarget)) {
    authRoute = authRoute.replace(tryTarget, tryReplace);
}

// Add the GET invite checking route
if(!authRoute.includes("router.get('/invite/:id'")) {
    const inviteRoute = `// Verify invitation link
router.get('/invite/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ msg: 'Invalid invitation link' });
    if (employee.userId) return res.status(400).json({ msg: 'Invitation already used' });
    res.json({ email: employee.email, name: \`\${employee.name} \${employee.surname}\`.trim() });
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

`;
    authRoute = authRoute.replace("// Register a new user", inviteRoute + "// Register a new user");
}

fs.writeFileSync('routes/auth.js', authRoute);

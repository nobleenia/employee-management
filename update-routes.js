const fs = require('fs');

let empRoutes = fs.readFileSync('routes/employees.js', 'utf8');
if (!empRoutes.includes("router.get('/:id'")) {
    empRoutes = empRoutes.replace("module.exports = router;", `
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, organizationId: req.user.organizationId }).populate('department', 'name');
    if (!employee) return res.status(404).json({ msg: 'Employee not found' });
    res.json(employee);
  } catch (err) { next(err); }
});

router.put('/:id/status', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { status: req.body.status },
      { new: true }
    );
    if (!employee) return res.status(404).json({ msg: 'Employee not found' });
    res.json(employee);
  } catch (err) { next(err); }
});

module.exports = router;
`);
    fs.writeFileSync('routes/employees.js', empRoutes);
}

let deptRoutes = fs.readFileSync('routes/departments.js', 'utf8');
if (!deptRoutes.includes("router.get('/:id'")) {
    deptRoutes = deptRoutes.replace("module.exports = router;", `
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!department) return res.status(404).json({ msg: 'Department not found' });
    res.json(department);
  } catch (err) { next(err); }
});

module.exports = router;
`);
    fs.writeFileSync('routes/departments.js', deptRoutes);
}


const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const Employee = require('../models/Employee');
const ChecklistTemplate = require('../models/ChecklistTemplate');
const EmployeeChecklist = require('../models/EmployeeChecklist');
const Review = require('../models/Review');

router.use(authenticate);
router.use(authorize('admin', 'manager'));

router.post('/checklists/templates', async (req, res) => {
  try {
    const template = await ChecklistTemplate.create({
      ...req.body,
      organizationId: req.user.organizationId
    });
    res.status(201).json(template);
  } catch (err) { res.status(500).json(err); }
});

router.post('/checklists/assign', async (req, res) => {
  try {
    const { employeeId, templateId } = req.body;
    const template = await ChecklistTemplate.findById(templateId);
    if (!template) return res.status(404).json({message: 'Template not found'});

    const checklist = await EmployeeChecklist.create({
      employeeId,
      templateId,
      tasks: template.tasks.map(t => ({ task: t, completed: false })),
      organizationId: req.user.organizationId
    });
    res.status(201).json(checklist);
  } catch (err) { res.status(500).json(err); }
});

// Employee self-service update route
router.put('/checklists/:id/tasks/:taskId', async (req, res) => {
    try {
        const checklist = await EmployeeChecklist.findOne({_id: req.params.id, organizationId: req.user.organizationId});
        if(!checklist) return res.status(404).json({message: "Not found"});
        const task = checklist.tasks.id(req.params.taskId);
        task.completed = req.body.completed;
        await checklist.save();
        res.json(checklist);
    } catch(err) { res.status(500).json(err); }
});

router.post('/reviews', async (req, res) => {
    try {
        const review = await Review.create({
            ...req.body,
            organizationId: req.user.organizationId
        });
        res.status(201).json(review);
    } catch(err) { res.status(500).json(err); }
});

router.get('/org-tree', async (req, res) => {
    try {
        const employees = await Employee.find({organizationId: req.user.organizationId});
        
        const buildTree = (parentId = null) => {
            return employees
                .filter(e => {
                    if (parentId === null) {
                        return !e.managerId;
                    }
                    return e.managerId && String(e.managerId) === String(parentId);
                })
                .map(e => ({
                    id: e._id,
                    name: `${e.name} ${e.surname}`,
                    position: e.role,
                    children: buildTree(e._id)
                }));
        };
        
        res.json(buildTree(null));
    } catch(err) {
        res.status(500).json({ message: "Error building org chart" });
    }
});

module.exports = router;

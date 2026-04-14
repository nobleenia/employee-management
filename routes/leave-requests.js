const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const ActivityLog = require('../models/ActivityLog');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Employee: get their own requests
router.get('/my-requests', authenticate, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, organizationId: req.user.organizationId });
    if (!employee) return res.status(404).json({ msg: 'Employee profile not found' });
    
    const requests = await LeaveRequest.find({ employeeId: employee._id, organizationId: req.user.organizationId });
    res.json(requests);
  } catch (err) { next(err); }
});

// Employee: submit a new leave request
router.post('/', authenticate, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, organizationId: req.user.organizationId });
    if (!employee) return res.status(404).json({ msg: 'Employee profile not found' });

    const { type, startDate, endDate } = req.body;
    const leaveRequest = new LeaveRequest({
      employeeId: employee._id,
      type,
      startDate,
      endDate,
      organizationId: req.user.organizationId
    });
    await leaveRequest.save();

    await ActivityLog.create({
      action: 'Leave Requested',
      description: `${employee.name} ${employee.surname} requested ${type} leave`,
      user: req.user.name,
      organizationId: req.user.organizationId
    });

    res.status(201).json(leaveRequest);
  } catch (err) { next(err); }
});

// Admin: get all leave requests
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const requests = await LeaveRequest.find({ organizationId: req.user.organizationId }).populate('employeeId', 'name surname');
    res.json(requests);
  } catch (err) { next(err); }
});

// Admin: approve/deny leave request
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Denied'].includes(status)) return res.status(400).json({ msg: 'Invalid status' });

    const request = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { status },
      { new: true }
    ).populate('employeeId', 'name surname');

    if (!request) return res.status(404).json({ msg: 'Request not found' });

    await ActivityLog.create({
      action: 'Leave Updated',
      description: `Leave for ${request.employeeId.name} marked as ${status}`,
      user: req.user.name,
      organizationId: req.user.organizationId
    });

    res.json(request);
  } catch (err) { next(err); }
});

module.exports = router;

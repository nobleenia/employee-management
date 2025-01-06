// middleware/role.js
module.exports = (requiredRole) => (req, res, next) => {
  if (req.user.role !== requiredRole) {
    return res.status(403).json({ msg: 'Access Denied: Insufficient Permissions' });
  }
  next();
};

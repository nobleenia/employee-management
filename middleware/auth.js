const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.cookies.token || (req.header('Authorization') && req.header('Authorization').replace('Bearer ', ''));

  if (!token) {
    return res.status(401).json({ msg: 'Access Denied: No Token Provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach decoded user info to request object
    next(); // Allow access to the route
  } catch (err) {
    console.error('Token Verification Error:', err.message);
    res.status(400).json({ msg: 'Invalid Token' });
  }
};

module.exports = authenticate;

const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).send('Access Denied: No Token Provided');
  }

  try {
    const tokenWithoutBearer = token.split(' ')[1]; // Remove "Bearer" prefix
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach decoded user info to request object
    next(); // Allow access to the route
  } catch (err) {
    console.error('Token Verification Error:', err.message);
    res.status(400).send('Invalid Token');
  }
};

module.exports = authenticate;

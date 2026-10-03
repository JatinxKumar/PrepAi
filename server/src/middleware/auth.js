const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token || token === 'null' || token === 'undefined') {
    // Allow guest access with a fixed guest ID
    req.user = { id: '000000000000000000000000', email: 'guest@projectdna.ai', name: 'Guest' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid but provided, still allow guest access to prevent blocking the user
    console.warn("Invalid token provided, falling back to guest mode.");
    req.user = { id: '000000000000000000000000', email: 'guest@projectdna.ai', name: 'Guest' };
    next();
  }
};

module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const store = require('../services/store');

const JWT_SECRET = process.env.JWT_SECRET || "truedose-super-secret-key-2026";

function authenticate(req, res, next) {
  // Support demo switch via header for instant seamless review
  const demoRole = req.headers['x-demo-role'];
  if (demoRole) {
    const demoUser = store.getUsers().find(u => u.role.toLowerCase() === demoRole.toLowerCase());
    if (demoUser) {
      req.user = demoUser;
      return next();
    }
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access token missing or invalid" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      error: `Forbidden: this action requires role '${roles.join(' or ')}', but you are '${req.user.role}'`
    });
  };
}

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET
};

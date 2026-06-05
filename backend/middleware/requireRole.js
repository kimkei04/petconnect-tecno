import db from '../db.js';

export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const [rows] = await db.query('SELECT role, is_active FROM users WHERE id = ?', [req.userId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = rows[0];
      if (!user.is_active) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      const allowedRoles = typeof roles === 'string' ? [roles] : roles;
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }
      
      req.userRole = user.role;
      next();
    } catch (err) {
      console.error('Role validation error:', err);
      res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };
};

export default requireRole;

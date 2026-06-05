import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per IP
  message: { message: 'Too many authentication attempts. Please try again after 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, barangay, clinic_name, license_number, email_alerts, sms_alerts } = req.body;
    await db.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, barangay = ?, clinic_name = ?, license_number = ?, email_alerts = ?, sms_alerts = ? WHERE id = ?',
      [name, email, phone, barangay || null, clinic_name || null, license_number || null, email_alerts ?? 1, sms_alerts ?? 0, req.userId]
    );
    
    const [rows] = await db.query('SELECT id, name, email, phone, role, barangay, clinic_name, license_number, email_alerts, sms_alerts FROM users WHERE id = ?', [req.userId]);
    res.json({ message: 'Profile updated successfully', user: rows[0] });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/\d/).withMessage('Password must contain at least one number'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, email, phone, password, role, barangay, clinic_name, license_number } = req.body;
      
      // Check if email already exists
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email address is already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await db.query(
        'INSERT INTO users (name, email, phone, password, role, barangay, clinic_name, license_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone || null, hashedPassword, role || 'owner', barangay || null, clinic_name || null, license_number || null]
      );
      
      const user = { 
        id: result.insertId, 
        name, 
        email, 
        role: role || 'owner',
        barangay: barangay || null,
        clinic_name: clinic_name || null,
        license_number: license_number || null
      };
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      
      res.status(201).json({ token, user });
    } catch (err) {
      console.error('Registration Error:', err);
      res.status(500).json({ message: 'Registration failed', error: err.message });
    }
  }
);

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    if (!user.is_active) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    delete user.password;
    
    res.json({ token, user });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

export default router;

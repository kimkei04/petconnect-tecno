import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

// Public: Report a stray animal
router.post('/', async (req, res) => {
  try {
    const { reporter_name, description, photo_url, species, latitude, longitude, location_description, barangay } = req.body;
    
    let reporterId = null;
    
    // Check if user is logged in
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'null') {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          reporterId = decoded.id;
        } catch (e) {
          // Token invalid, proceed anonymously
        }
      }
    }

    const [result] = await db.query(
      `INSERT INTO stray_reports (reporter_id, reporter_name, description, photo_url, species, latitude, longitude, location_description, barangay, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "open")`,
      [reporterId, reporter_name || 'Anonymous', description, photo_url || null, species || 'Dog', latitude || null, longitude || null, location_description || null, barangay || null]
    );

    // Notify LGUs in the same barangay
    if (barangay) {
      const [lguAdmins] = await db.query('SELECT id FROM users WHERE role = "lgu" AND barangay = ?', [barangay]);
      for (const admin of lguAdmins) {
        await db.query(
          'INSERT INTO notifications (user_id, type, title, message) VALUES (?, "lost_alert", ?, ?)',
          [
            admin.id,
            `New Stray Animal Sighted!`,
            `A stray ${species} was reported in Barangay ${barangay}: "${description}"`
          ]
        );
      }
    }

    res.status(201).json({ id: result.insertId, message: 'Stray animal reported successfully' });
  } catch (err) {
    console.error('Report Stray Error:', err);
    res.status(500).json({ message: 'Failed to report stray animal' });
  }
});

// Authenticated LGU: Get all stray reports
router.get('/', auth, requireRole(['lgu', 'admin']), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stray_reports ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Get Strays Error:', err);
    res.status(500).json({ message: 'Failed to retrieve stray reports' });
  }
});

export default router;

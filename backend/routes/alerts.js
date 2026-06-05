import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user notifications/alerts
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get Notifications Error:', err);
    res.status(500).json({ message: 'Failed to retrieve alerts' });
  }
});

// Mark alert as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ message: 'Alert marked as read' });
  } catch (err) {
    console.error('Mark Alert Read Error:', err);
    res.status(500).json({ message: 'Failed to mark alert as read' });
  }
});

// Delete alert
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ message: 'Alert deleted successfully' });
  } catch (err) {
    console.error('Delete Alert Error:', err);
    res.status(500).json({ message: 'Failed to delete alert' });
  }
});

export default router;

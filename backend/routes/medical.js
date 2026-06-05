import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

router.use(auth);

// Get medical records for a pet
router.get('/pet/:petId', async (req, res) => {
  try {
    const petId = req.params.petId;
    
    // Security check: owner or vet only
    const [rows] = await db.query('SELECT owner_id FROM pets WHERE id = ?', [petId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pet not found' });
    
    const ownerId = rows[0].owner_id;
    const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    const userRole = userRows[0].role;
    
    if (userRole === 'owner' && ownerId !== req.userId) {
      return res.status(403).json({ message: 'Access denied: not your pet' });
    }

    const [records] = await db.query(
      `SELECT m.*, u.name as vet_name, u.clinic_name 
       FROM medical_records m 
       LEFT JOIN users u ON m.vet_id = u.id 
       WHERE m.pet_id = ? 
       ORDER BY m.record_date DESC`,
      [petId]
    );
    res.json(records);
  } catch (err) {
    console.error('Get Medical Records Error:', err);
    res.status(500).json({ message: 'Failed to retrieve medical records' });
  }
});

// Add medical record (LGU admins and System admins only)
router.post('/', requireRole(['lgu', 'admin']), async (req, res) => {
  try {
    const { pet_id, record_type, title, description, diagnosis, treatment, attachment_url, record_date } = req.body;
    
    const [pets] = await db.query('SELECT name FROM pets WHERE id = ?', [pet_id]);
    if (pets.length === 0) return res.status(404).json({ message: 'Pet not found' });
    const petName = pets[0].name;

    const [result] = await db.query(
      `INSERT INTO medical_records (pet_id, record_type, title, description, diagnosis, treatment, vet_id, attachment_url, record_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pet_id, record_type, title, description || null, diagnosis || null, treatment || null, req.userId, attachment_url || null, record_date]
    );

    // Notify Owner
    const [ownerRows] = await db.query('SELECT owner_id FROM pets WHERE id = ?', [pet_id]);
    const ownerId = ownerRows[0].owner_id;

    await db.query(
      'INSERT INTO notifications (user_id, pet_id, type, title, message) VALUES (?, ?, "medical", ?, ?)',
      [
        ownerId,
        pet_id,
        `New Medical Record Added`,
        `Dr. added a new medical record "${title}" for ${petName}.`
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Medical record added successfully' });
  } catch (err) {
    console.error('Create Medical Record Error:', err);
    res.status(500).json({ message: 'Failed to add medical record' });
  }
});

// Delete medical record
router.delete('/:id', requireRole(['lgu', 'admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM medical_records WHERE id = ?', [req.params.id]);
    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    console.error('Delete Medical Record Error:', err);
    res.status(500).json({ message: 'Failed to delete medical record' });
  }
});

export default router;

import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

router.use(auth);

// Get vaccinations for a pet
router.get('/pet/:petId', async (req, res) => {
  try {
    const petId = req.params.petId;
    
    // Security check: owner, vet, or lgu only
    const [rows] = await db.query('SELECT owner_id FROM pets WHERE id = ?', [petId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pet not found' });
    
    const ownerId = rows[0].owner_id;
    const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    const userRole = userRows[0].role;
    
    if (userRole === 'owner' && ownerId !== req.userId) {
      return res.status(403).json({ message: 'Access denied: not your pet' });
    }

    const [vax] = await db.query(
      `SELECT v.*, u.name as vet_name, u.clinic_name 
       FROM vaccinations v 
       LEFT JOIN users u ON v.administered_by = u.id 
       WHERE v.pet_id = ? 
       ORDER BY v.date_given DESC`,
      [petId]
    );
    res.json(vax);
  } catch (err) {
    console.error('Get Vaccinations Error:', err);
    res.status(500).json({ message: 'Failed to retrieve vaccination records' });
  }
});

// Administer vaccination (LGU admins only)
router.post('/', requireRole(['lgu', 'admin']), async (req, res) => {
  try {
    const { pet_id, vaccine_name, date_given, next_due_date, clinic_name, batch_number, campaign_id, notes } = req.body;
    
    // Check if pet exists
    const [pets] = await db.query('SELECT name FROM pets WHERE id = ?', [pet_id]);
    if (pets.length === 0) return res.status(404).json({ message: 'Pet not found' });
    const petName = pets[0].name;

    // Get vet details
    const [vetRows] = await db.query('SELECT clinic_name FROM users WHERE id = ?', [req.userId]);
    const vetClinic = vetRows[0].clinic_name;

    const [result] = await db.query(
      `INSERT INTO vaccinations (pet_id, vaccine_name, date_given, next_due_date, administered_by, clinic_name, batch_number, campaign_id, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pet_id, vaccine_name, date_given, next_due_date || null, req.userId, clinic_name || vetClinic || null, batch_number || null, campaign_id || null, notes || null]
    );

    // If next due date is provided, create a reminder notification for owner
    const [ownerRows] = await db.query('SELECT owner_id FROM pets WHERE id = ?', [pet_id]);
    const ownerId = ownerRows[0].owner_id;

    if (next_due_date) {
      await db.query(
        'INSERT INTO notifications (user_id, pet_id, type, title, message) VALUES (?, ?, "vaccine_reminder", ?, ?)',
        [
          ownerId,
          pet_id,
          `Vaccine Booster Due soon!`,
          `${petName} is due for a ${vaccine_name} booster on ${next_due_date}.`
        ]
      );
    }

    res.status(201).json({ id: result.insertId, message: 'Vaccination record added successfully' });
  } catch (err) {
    console.error('Create Vaccination Error:', err);
    res.status(500).json({ message: 'Failed to add vaccination record' });
  }
});

// Delete vaccination record
router.delete('/:id', requireRole(['vet', 'admin']), async (req, res) => {
  try {
    await db.query('DELETE FROM vaccinations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vaccination record deleted successfully' });
  } catch (err) {
    console.error('Delete Vaccination Error:', err);
    res.status(500).json({ message: 'Failed to delete vaccination record' });
  }
});

export default router;

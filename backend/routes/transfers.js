import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// Get my pending transfers (both sent and received)
router.get('/my-transfers', async (req, res) => {
  try {
    const [sent] = await db.query(
      `SELECT t.*, p.name as pet_name, p.photo_url, u.email as target_email, u.name as target_name
       FROM ownership_transfers t
       JOIN pets p ON t.pet_id = p.id
       JOIN users u ON t.to_user_id = u.id
       WHERE t.from_user_id = ? AND t.status = 'pending'`,
      [req.userId]
    );

    const [received] = await db.query(
      `SELECT t.*, p.name as pet_name, p.photo_url, u.email as owner_email, u.name as owner_name
       FROM ownership_transfers t
       JOIN pets p ON t.pet_id = p.id
       JOIN users u ON t.from_user_id = u.id
       WHERE t.to_user_id = ? AND t.status = 'pending'`,
      [req.userId]
    );

    res.json({ sent, received });
  } catch (err) {
    console.error('Get Transfers Error:', err);
    res.status(500).json({ message: 'Failed to retrieve transfers' });
  }
});

// Initiate pet ownership transfer
router.post('/', async (req, res) => {
  try {
    const { pet_id, target_email, reason } = req.body;
    
    // Verify pet ownership
    const [pets] = await db.query('SELECT name, owner_id FROM pets WHERE id = ? AND owner_id = ?', [pet_id, req.userId]);
    if (pets.length === 0) return res.status(404).json({ message: 'Pet not found or not owned by you' });
    const petName = pets[0].name;

    // Find target user
    const [targets] = await db.query('SELECT id, name FROM users WHERE email = ?', [target_email]);
    if (targets.length === 0) return res.status(404).json({ message: 'Target user email not registered in PetConnect' });
    const targetUser = targets[0];

    if (targetUser.id === req.userId) {
      return res.status(400).json({ message: 'You cannot transfer pet ownership to yourself' });
    }

    // Check if there is already a pending transfer
    const [existing] = await db.query(
      'SELECT id FROM ownership_transfers WHERE pet_id = ? AND status = "pending"',
      [pet_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'There is already a pending transfer for this pet' });
    }

    // Insert ownership transfer request
    const [result] = await db.query(
      'INSERT INTO ownership_transfers (pet_id, from_user_id, to_user_id, status, reason) VALUES (?, ?, ?, "pending", ?)',
      [pet_id, req.userId, targetUser.id, reason || null]
    );

    // Notify target user
    await db.query(
      'INSERT INTO notifications (user_id, pet_id, type, title, message) VALUES (?, ?, "transfer", ?, ?)',
      [
        targetUser.id,
        pet_id,
        `Pet Transfer Request`,
        `Someone wants to transfer ownership of ${petName} to you.`
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Transfer request sent successfully' });
  } catch (err) {
    console.error('Initiate Transfer Error:', err);
    res.status(500).json({ message: 'Failed to initiate transfer' });
  }
});

// Accept pet transfer
router.post('/:id/accept', async (req, res) => {
  try {
    const transferId = req.params.id;
    
    // Verify transfer request
    const [transfers] = await db.query(
      'SELECT * FROM ownership_transfers WHERE id = ? AND to_user_id = ? AND status = "pending"',
      [transferId, req.userId]
    );
    if (transfers.length === 0) return res.status(404).json({ message: 'Transfer request not found or already processed' });
    const transfer = transfers[0];

    // Begin updates
    // 1. Update pet owner
    await db.query('UPDATE pets SET owner_id = ?, status = "healthy" WHERE id = ?', [req.userId, transfer.pet_id]);
    
    // 2. Update transfer record
    await db.query(
      'UPDATE ownership_transfers SET status = "accepted", resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [transferId]
    );

    // 3. Notify old owner
    const [petRows] = await db.query('SELECT name FROM pets WHERE id = ?', [transfer.pet_id]);
    const petName = petRows[0].name;

    await db.query(
      'INSERT INTO notifications (user_id, pet_id, type, title, message) VALUES (?, ?, "transfer", ?, ?)',
      [
        transfer.from_user_id,
        transfer.pet_id,
        `Pet Transfer Accepted`,
        `Your ownership transfer request for ${petName} has been accepted.`
      ]
    );

    res.json({ message: 'Ownership transferred successfully. This pet is now in your dashboard.' });
  } catch (err) {
    console.error('Accept Transfer Error:', err);
    res.status(500).json({ message: 'Failed to accept transfer' });
  }
});

// Reject pet transfer
router.post('/:id/reject', async (req, res) => {
  try {
    const transferId = req.params.id;
    
    // Verify transfer request
    const [transfers] = await db.query(
      'SELECT * FROM ownership_transfers WHERE id = ? AND to_user_id = ? AND status = "pending"',
      [transferId, req.userId]
    );
    if (transfers.length === 0) return res.status(404).json({ message: 'Transfer request not found or already processed' });
    const transfer = transfers[0];

    // Update transfer status
    await db.query(
      'UPDATE ownership_transfers SET status = "rejected", resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [transferId]
    );

    // Notify old owner
    const [petRows] = await db.query('SELECT name FROM pets WHERE id = ?', [transfer.pet_id]);
    const petName = petRows[0].name;

    await db.query(
      'INSERT INTO notifications (user_id, pet_id, type, title, message) VALUES (?, ?, "transfer", ?, ?)',
      [
        transfer.from_user_id,
        transfer.pet_id,
        `Pet Transfer Rejected`,
        `Your ownership transfer request for ${petName} was declined.`
      ]
    );

    res.json({ message: 'Transfer request declined.' });
  } catch (err) {
    console.error('Reject Transfer Error:', err);
    res.status(500).json({ message: 'Failed to reject transfer' });
  }
});

export default router;

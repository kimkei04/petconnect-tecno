import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth for modifying adoptions
router.use(auth);

// Get listings created by the logged-in user
router.get('/my-listings', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM adoption_listings WHERE posted_by = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get My Adoptions Error:', err);
    res.status(500).json({ message: 'Failed to retrieve your adoption listings' });
  }
});

// Post a new pet for adoption
router.post('/', async (req, res) => {
  try {
    const { pet_name, species, breed, estimated_age, description, photo_url, barangay } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO adoption_listings (pet_name, species, breed, estimated_age, description, photo_url, barangay, posted_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "available")',
      [pet_name, species, breed, estimated_age, description, photo_url || null, barangay || null, req.userId]
    );
    
    res.status(201).json({ id: result.insertId, message: 'Pet listed for adoption successfully' });
  } catch (err) {
    console.error('Post Adoption Listing Error:', err);
    res.status(500).json({ message: 'Failed to list pet for adoption' });
  }
});

// Update listing status
router.put('/:id', async (req, res) => {
  try {
    const { status, adopted_by } = req.body;
    const listingId = req.params.id;
    
    // Check ownership
    const [listing] = await db.query('SELECT posted_by FROM adoption_listings WHERE id = ?', [listingId]);
    if (listing.length === 0) return res.status(404).json({ message: 'Listing not found' });
    
    // Get user details
    const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    const userRole = userRows[0].role;

    if (listing[0].posted_by !== req.userId && userRole !== 'lgu' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied: not your listing' });
    }

    await db.query(
      'UPDATE adoption_listings SET status = ?, adopted_by = ?, adopted_at = ? WHERE id = ?',
      [status, adopted_by || null, status === 'adopted' ? new Date() : null, listingId]
    );
    
    res.json({ message: 'Adoption listing updated successfully' });
  } catch (err) {
    console.error('Update Adoption Listing Error:', err);
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

// Delete listing
router.delete('/:id', async (req, res) => {
  try {
    const listingId = req.params.id;
    
    // Check ownership
    const [listing] = await db.query('SELECT posted_by FROM adoption_listings WHERE id = ?', [listingId]);
    if (listing.length === 0) return res.status(404).json({ message: 'Listing not found' });

    // Get user details
    const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    const userRole = userRows[0].role;

    if (listing[0].posted_by !== req.userId && userRole !== 'lgu' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied: not your listing' });
    }

    await db.query('DELETE FROM adoption_listings WHERE id = ?', [listingId]);
    res.json({ message: 'Adoption listing deleted successfully' });
  } catch (err) {
    console.error('Delete Adoption Listing Error:', err);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

export default router;

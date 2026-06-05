import express from 'express';
import db from '../db.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = express.Router();

// Apply LGU role guard to all routes in this file
router.use(auth);
router.use(requireRole(['lgu', 'admin']));

// Get LGU real-time analytics
router.get('/stats', async (req, res) => {
  try {
    const [totalPets] = await db.query('SELECT COUNT(*) as count FROM pets');
    const [lostPets] = await db.query('SELECT COUNT(*) as count FROM lost_pet_reports WHERE status = "active"');
    const [totalOwners] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "owner"');
    const [straysOpen] = await db.query('SELECT COUNT(*) as count FROM stray_reports WHERE status = "open"');
    const [reunitedTotal] = await db.query('SELECT COUNT(*) as count FROM lost_pet_reports WHERE status = "resolved"');
    const [scansTotal] = await db.query('SELECT COUNT(*) as count FROM scan_logs');
    const [newPetsMonth] = await db.query('SELECT COUNT(*) as count FROM pets WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)');
    
    // Get barangay breakdown
    const [barangayStats] = await db.query(
      'SELECT barangay, COUNT(*) as count FROM pets WHERE barangay IS NOT NULL GROUP BY barangay ORDER BY count DESC LIMIT 5'
    );

    res.json({
      total_pets: totalPets[0].count,
      lost_pets: lostPets[0].count,
      total_owners: totalOwners[0].count,
      strays_open: straysOpen[0].count,
      reunited_total: reunitedTotal[0].count,
      scans_total: scansTotal[0].count,
      new_this_month: newPetsMonth[0].count,
      barangay_breakdown: barangayStats
    });
  } catch (err) {
    console.error('LGU Stats Error:', err);
    res.status(500).json({ message: 'Failed to retrieve analytics' });
  }
});

// Get active lost pet alerts (enhanced from lost_pet_reports)
router.get('/alerts', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, p.name as pet_name, p.breed, p.photo_url, r.last_seen_location as address, u.name as owner_name, r.created_at as reported_at 
       FROM lost_pet_reports r
       JOIN pets p ON r.pet_id = p.id 
       JOIN users u ON r.reporter_id = u.id 
       WHERE r.status = "active" 
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('LGU Alerts Error:', err);
    res.status(500).json({ message: 'Failed to retrieve lost pet alerts' });
  }
});

// Strays management
router.get('/strays', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stray_reports ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('LGU Strays Error:', err);
    res.status(500).json({ message: 'Failed to retrieve stray reports' });
  }
});

router.put('/strays/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE stray_reports SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Stray report status updated' });
  } catch (err) {
    console.error('Update Stray Error:', err);
    res.status(500).json({ message: 'Failed to update stray report' });
  }
});

// Vaccination campaigns management
router.get('/campaigns', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vaccination_campaigns ORDER BY campaign_date ASC');
    res.json(rows);
  } catch (err) {
    console.error('Get Campaigns Error:', err);
    res.status(500).json({ message: 'Failed to retrieve vaccination campaigns' });
  }
});

router.post('/campaigns', async (req, res) => {
  try {
    const { title, description, vaccine_type, target_barangay, campaign_date, location } = req.body;
    const [result] = await db.query(
      'INSERT INTO vaccination_campaigns (created_by, title, description, vaccine_type, target_barangay, campaign_date, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, "upcoming")',
      [req.userId, title, description, vaccine_type, target_barangay, campaign_date, location]
    );
    res.status(201).json({ id: result.insertId, message: 'Campaign created successfully' });
  } catch (err) {
    console.error('Create Campaign Error:', err);
    res.status(500).json({ message: 'Failed to create campaign' });
  }
});

router.delete('/campaigns/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM vaccination_campaigns WHERE id = ?', [req.params.id]);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error('Delete Campaign Error:', err);
    res.status(500).json({ message: 'Failed to delete campaign' });
  }
});

// Adoption listings management
router.get('/adoptions', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM adoption_listings ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('LGU Adoptions Error:', err);
    res.status(500).json({ message: 'Failed to retrieve adoption listings' });
  }
});

router.post('/adoptions', async (req, res) => {
  try {
    const { pet_name, species, breed, estimated_age, description, photo_url, barangay } = req.body;
    const [result] = await db.query(
      'INSERT INTO adoption_listings (pet_name, species, breed, estimated_age, description, photo_url, barangay, posted_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "available")',
      [pet_name, species, breed, estimated_age, description, photo_url || null, barangay || null, req.userId]
    );
    res.status(201).json({ id: result.insertId, message: 'Adoption pet listed successfully' });
  } catch (err) {
    console.error('Create Adoption Error:', err);
    res.status(500).json({ message: 'Failed to list pet for adoption' });
  }
});

router.put('/adoptions/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query(
      'UPDATE adoption_listings SET status = ?, adopted_at = ? WHERE id = ?',
      [status, status === 'adopted' ? new Date() : null, req.params.id]
    );
    res.json({ message: 'Adoption listing updated' });
  } catch (err) {
    console.error('Update Adoption Error:', err);
    res.status(500).json({ message: 'Failed to update adoption listing' });
  }
});

export default router;

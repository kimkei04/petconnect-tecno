import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get public pet profile (NFC/QR scan landing page)
router.get('/tag/:tagId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, u.name as owner_name, u.phone as owner_phone FROM pets p JOIN users u ON p.owner_id = u.id WHERE p.tag_id = ?',
      [req.params.tagId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Tag not found' });
    
    const pet = rows[0];
    
    // Privacy filtering
    if (pet.hide_phone) {
      delete pet.owner_phone;
    }
    if (pet.hide_address) {
      delete pet.address;
    }
    
    // Fetch emergency contacts for the scan page
    const [emergencyContacts] = await db.query('SELECT * FROM emergency_contacts WHERE pet_id = ?', [pet.id]);
    pet.emergencyContacts = emergencyContacts;
    
    // Fetch vaccinations (only show if not hidden)
    if (!pet.hide_medical) {
      const [vaccinations] = await db.query('SELECT vaccine_name, date_given, next_due_date FROM vaccinations WHERE pet_id = ? ORDER BY date_given DESC', [pet.id]);
      pet.vaccinations = vaccinations;
    } else {
      pet.vaccinations = [];
    }
    
    res.json(pet);
  } catch (err) {
    console.error('Public Tag Retrieval Error:', err);
    res.status(500).json({ message: 'Failed to retrieve public pet profile' });
  }
});

// Log tag scan
router.post('/scan/:tagId', async (req, res) => {
  try {
    const { lat, lng, scanType } = req.body;
    const [pets] = await db.query('SELECT id, name, owner_id FROM pets WHERE tag_id = ?', [req.params.tagId]);
    
    if (pets.length > 0) {
      const pet = pets[0];
      
      // Log the scan
      await db.query(
        'INSERT INTO scan_logs (pet_id, scan_type, latitude, longitude, scanner_ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [pet.id, scanType || 'qr', lat || null, lng || null, req.ip, req.headers['user-agent']]
      );
      
      // Notify the owner
      await db.query(
        'INSERT INTO notifications (user_id, pet_id, type, title, message, latitude, longitude) VALUES (?, ?, "scan", ?, ?, ?, ?)',
        [
          pet.owner_id, 
          pet.id, 
          `${pet.name} Scanned!`, 
          `Someone scanned ${pet.name}'s tag. Location: ${lat && lng ? `${lat}, ${lng}` : 'Browser location not shared'}.`,
          lat || null, 
          lng || null
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Log Scan Error:', err);
    res.status(500).json({ message: 'Failed to record scan' });
  }
});

// Public message to owner via tag scan page
router.post('/message/:tagId', async (req, res) => {
  try {
    const { message, contactInfo } = req.body;
    const [pets] = await db.query('SELECT id, name, owner_id FROM pets WHERE tag_id = ?', [req.params.tagId]);
    
    if (pets.length > 0) {
      const pet = pets[0];
      await db.query(
        'INSERT INTO notifications (user_id, pet_id, type, title, message) VALUES (?, ?, "sighting", ?, ?)',
        [
          pet.owner_id, 
          pet.id, 
          `Message regarding ${pet.name}`, 
          `Message from scanner: "${message}". Contact details provided: ${contactInfo || 'None'}`
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Public Send Message Error:', err);
    res.status(500).json({ message: 'Failed to send message to owner' });
  }
});

// Get all active lost pet reports for community board
router.get('/lost', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, p.name as pet_name, p.species, p.breed, p.photo_url, p.sex, p.color, u.name as owner_name, u.phone as owner_phone
       FROM lost_pet_reports r
       JOIN pets p ON r.pet_id = p.id
       JOIN users u ON r.reporter_id = u.id
       WHERE r.status = 'active'
       ORDER BY r.created_at DESC`
    );
    
    // Privacy filtering
    rows.forEach(row => {
      if (row.hide_phone) {
        delete row.owner_phone;
      }
    });
    
    res.json(rows);
  } catch (err) {
    console.error('Get Public Lost Pets Error:', err);
    res.status(500).json({ message: 'Failed to retrieve lost pets list' });
  }
});

// Report sighting for lost pet report
router.post('/sighting/:reportId', async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const { reporter_name, reporter_phone, message, photo_url, latitude, longitude } = req.body;
    
    const [reports] = await db.query('SELECT pet_id, reporter_id FROM lost_pet_reports WHERE id = ? AND status = "active"', [reportId]);
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Lost pet report not found or has been resolved' });
    }
    const report = reports[0];
    
    await db.query(
      'INSERT INTO community_sightings (lost_report_id, reporter_name, reporter_phone, message, photo_url, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [reportId, reporter_name || null, reporter_phone || null, message, photo_url || null, latitude || null, longitude || null]
    );
    
    const [petRows] = await db.query('SELECT name FROM pets WHERE id = ?', [report.pet_id]);
    const petName = petRows[0].name;
    
    // Notify the owner
    await db.query(
      'INSERT INTO notifications (user_id, pet_id, type, title, message, latitude, longitude, action_url) VALUES (?, ?, "sighting", ?, ?, ?, ?, ?)',
      [
        report.reporter_id, 
        report.pet_id, 
        'Community Sighting Sighted!', 
        `A sighting was reported for ${petName}: "${message}"`, 
        latitude || null, 
        longitude || null,
        `/lost-pet` // Direct link to lost pet board/details
      ]
    );
    
    res.json({ success: true, message: 'Sighting reported successfully' });
  } catch (err) {
    console.error('Report Sighting Error:', err);
    res.status(500).json({ message: 'Failed to report sighting' });
  }
});

// Get all available adoptions
router.get('/adoptions', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, u.name as posted_by_name, u.phone as posted_by_phone, u.email as posted_by_email
       FROM adoption_listings a
       JOIN users u ON a.posted_by = u.id
       WHERE a.status = 'available'
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get Adoptions Error:', err);
    res.status(500).json({ message: 'Failed to retrieve adoption listings' });
  }
});

export default router;

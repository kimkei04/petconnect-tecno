import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './db.js'
import authRoutes from './routes/auth.js'
import petRoutes from './routes/pets.js'
import alertRoutes from './routes/alerts.js'
import publicRoutes from './routes/public.js'
import lguRoutes from './routes/lgu.js'
import vaccinationRoutes from './routes/vaccinations.js'
import medicalRoutes from './routes/medical.js'
import adoptionRoutes from './routes/adoptions.js'
import strayRoutes from './routes/strays.js'
import transferRoutes from './routes/transfers.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/lgu', lguRoutes)
app.use('/api/vaccinations', vaccinationRoutes)
app.use('/api/medical', medicalRoutes)
app.use('/api/adoptions', adoptionRoutes)
app.use('/api/strays', strayRoutes)
app.use('/api/transfers', transferRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'PetConnect Backend Running!' }))

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected');

    // Auto-patch database schema on startup
    try {
      console.log('🔄 Checking database schema and executing self-healing migrations...');
      
      // 1. Add note column to pets table if not exists
      const [columns] = await db.query("SHOW COLUMNS FROM pets LIKE 'note'");
      if (columns.length === 0) {
        console.log('➕ Adding note column to pets table...');
        await db.query('ALTER TABLE pets ADD COLUMN note TEXT DEFAULT NULL');
        console.log('✅ note column added');
      }
      
      // 2. Ensure species ENUM includes 'Rabbit'
      console.log('🔄 Updating species enum in pets table to include Rabbit...');
      await db.query("ALTER TABLE pets MODIFY COLUMN species ENUM('Dog','Cat','Bird','Rabbit','Other') DEFAULT 'Dog'");
      console.log('✅ species enum updated');
      
    } catch (schemaErr) {
      console.warn('⚠️ Non-fatal schema migration warning:', schemaErr.message);
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    if (!process.env.VERCEL) {
       console.error('   Check XAMPP MySQL is running and petconnect database exists.');
    }
  }

  // Only listen if not running in a Vercel serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🏠 Local: http://localhost:${PORT}`);
      console.log(`🌐 Network: Check your PC's IP address (e.g., http://192.168.x.x:${PORT})`);
    });
  }
}

start();

export default app;

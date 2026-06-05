import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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

// CORS setup - restrict origin to local environments
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', '*'], // allow local vite dev and all for mobile/local network dev
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🏠 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: Check your PC's IP address (e.g., http://192.168.x.x:${PORT})`);
});

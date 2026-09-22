import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import familyRoutes from './routes/family.routes';
import pool from './db';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS (רק פעם אחת!)
app.use(cors({
  origin: [ 'http://localhost:4200',
            'https://masuot-simulator.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);

// Health check
// Health check
app.get('/api/health', async (req, res) => {
  try {
    // נגיעה אמיתית ב-DB כדי למנוע מ-Supabase להיכנס ל-pause
    await pool.query('SELECT 1');

    console.log(
      `[HEALTH CHECK] ${new Date().toISOString()} | DB OK | IP: ${req.ip} | User-Agent: ${req.get('user-agent')}`
    );

    res.json({
      status: 'ok',
      database: 'ok',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('[HEALTH CHECK] DB ERROR:', error);

    res.status(500).json({
      status: 'error',
      database: 'error',
      timestamp: new Date()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
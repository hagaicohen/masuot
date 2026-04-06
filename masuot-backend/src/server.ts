import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import familyRoutes from './routes/family.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 ADDED
app.use(cors({
  origin: 'https://masuot-simulator.netlify.app'
}));

app.use(cors());
app.use(express.json());

app.use('/api/auth',   authRoutes);
app.use('/api/family', familyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
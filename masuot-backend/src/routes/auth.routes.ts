import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/login', (req, res, next) => {
  console.log('Login route hit:', req.body);
  next();
}, login);

router.post('/logout', logout);

export default router;
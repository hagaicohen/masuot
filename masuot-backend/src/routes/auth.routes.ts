import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/login', (req, res, next) => {
  console.log('Login attempt:', {
  budgetCode: req.body.budgetCode,
  hasPassword: !!req.body.password
});
  next();
}, login);

router.post('/logout', logout);

export default router;
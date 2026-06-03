import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/login', (req, res, next) => {
  console.log(
      'Budget Code:',
      Object.keys(req.body)[0],
      '=',
      Object.values(req.body)[0]
    );
  next();
}, login);

router.post('/logout', logout);

export default router;
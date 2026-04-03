import { Router } from 'express';
import { getFamily, getSimulation } from '../controllers/family.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/:budget_code',            authMiddleware, getFamily);
router.get('/:budget_code/simulation', authMiddleware, getSimulation);
router.post('/:budget_code/simulation', authMiddleware, getSimulation);

export default router;
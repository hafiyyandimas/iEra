import { Router } from 'express';
import { getCurrentUser, login, logout, register } from '../controllers/authController.js';
import { loginRateLimit, registrationRateLimit } from '../middleware/authRateLimit.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/register', registrationRateLimit, register);
router.post('/login', loginRateLimit, login);
router.get('/me', requireAuth, getCurrentUser);
router.post('/logout', logout);

export default router;

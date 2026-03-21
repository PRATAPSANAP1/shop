import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController';
import auth from '../middleware/auth';

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

export default router;

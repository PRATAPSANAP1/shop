import express from 'express';
const router = express.Router();
import * as dashboardController from '../controllers/dashboardController';
import auth from '../middleware/auth';

router.get('/stats', auth, dashboardController.getDashboardStats);

export default router;

import express from 'express';
const router = express.Router();
import * as notificationController from '../controllers/notificationController';
import auth from '../middleware/auth';

router.get('/', auth, notificationController.getNotifications);
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/read-all', auth, notificationController.markAllAsRead);

export default router;

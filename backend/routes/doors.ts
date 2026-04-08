import express from 'express';
const router = express.Router();
import * as doorController from '../controllers/doorController';
import auth from '../middleware/auth';

router.post('/', auth, doorController.createDoor);
router.get('/', auth, doorController.getDoors);
router.delete('/:id', auth, doorController.deleteDoor);
router.get('/public/:shopName', doorController.getPublicDoors);

export default router;

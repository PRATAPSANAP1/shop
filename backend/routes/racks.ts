import express from 'express';
const router = express.Router();
import * as rackController from '../controllers/rackController';
import auth from '../middleware/auth';

router.post('/', auth, rackController.createRack);
router.get('/', auth, rackController.getRacks);
router.put('/:id', auth, rackController.updateRack);
router.delete('/:id', auth, rackController.deleteRack);

export default router;

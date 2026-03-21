import express from 'express';
import { createShop, updateShop, getShop } from '../controllers/shopController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/', auth, createShop);
router.put('/', auth, updateShop);
router.get('/', auth, getShop);

export default router;
import express from 'express';
const router = express.Router();
import * as shopConfigController from '../controllers/shopConfigController';
import auth from '../middleware/auth';

router.post('/', auth, shopConfigController.saveShopConfig);
router.get('/', auth, shopConfigController.getShopConfig);
router.get('/public/shops/list', shopConfigController.listPublicShops);
router.get('/public/:shopName', shopConfigController.getPublicShopConfig);

export default router;

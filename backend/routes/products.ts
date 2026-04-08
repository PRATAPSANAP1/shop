import express from 'express';
const router = express.Router();
import * as productController from '../controllers/productController';
import auth from '../middleware/auth';

router.post('/', auth, productController.createProduct);
router.get('/', auth, productController.getProducts);
router.get('/rack/:rackId', auth, productController.getProductsByRack);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);
router.post('/scan', auth, productController.scanProduct);

export default router;

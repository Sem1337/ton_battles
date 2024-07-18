import express from 'express';
import ShopController from '../controllers/ShopController.js';

const router = express.Router();

router.get('/shop/items', ShopController.getShopItems);
router.post('/buy', ShopController.buyItem);

export default router;

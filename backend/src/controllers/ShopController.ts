import { Request, Response } from 'express';
import ShopService from '../services/ShopService.js';

class ShopController {
  static async getShopItems(req: Request, res: Response) {
    try {
      const user = (req as any).user
      const userId = user?.userId // Extract user ID from the verified token
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
      }
      const shopItems = await ShopService.getShopItemsForUser(userId);
      return res.status(200).json(shopItems);
    } catch (error) {
      console.error('Error fetching shop items:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async buyItem(req: Request, res: Response) {
    try {
      const user = (req as any).user
      const userId = user?.userId // Extract user ID from the verified token
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
      }
      const { itemId, costType } = req.body;

      const result = await ShopService.buyItem(userId, itemId, costType);
      if (result.success) {
        if (result.invoiceURL) {
          return res.status(200).json({ success: true, invoiceURL: result.invoiceURL });
        } else if (result.txPayload) {
          return res.status(200).json({success: true, txPayload: result.txPayload, cost: result.cost});
        } else {
          return res.status(200).json({ message: 'Purchase successful!' });
        }
      } else {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error('Error in buyItem:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default ShopController;

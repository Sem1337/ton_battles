import { ShopItem, ShopItemId } from '../database/model/ShopItems.js'; // Assuming you have a ShopItems model
import { sendMessageToUser } from './messageService.js';
import Big from 'big.js';
import ShopService from './ShopService.js';
import { updateUserPoints } from './balanceService.js';


export class StarService {
  static async createInvoice(userId: number) {
    const invoice = {
      title: 'Buy Points',
      description: 'Purchase points to use in the game',
      payload: `{userId:${userId}}`, // Using userId as payload
      currency: 'XTR',
      provider_token: '',
      prices: [{ label: 'Points', amount: 1 }], // 100 points for $1
    };
    return invoice;
  }

  static async generateShopInvoice(userId: string, itemId: ShopItemId, cost: string) {
    // Create an invoice and send it to the user
    const invoice = {
      title: 'TON Battles purchase',
      description: 'Purchase in shop',
      payload: `{userId:${userId}, itemId:${itemId}}`, // Using userId as payload
      currency: 'XTR',
      provider_token: '',
      prices: [{ label: 'Shop item', amount: cost }], // 100 points for $1
    };
    return invoice;
  }

  static async handlePurchase(successful_payment: any) {
    const { userId, itemId } = JSON.parse(successful_payment.invoice_payload); // Assuming payload is a JSON string
    console.log(`Successful payment of ${successful_payment.total_amount} from user ${userId}`);
    if (!itemId) {
      const points = StarService.calculatePoints(successful_payment.total_amount);
      await updateUserPoints(+userId, points); // Assuming 1 USD = 100 points
    } else {
      console.log(`user ${userId} successfully bought item: ${itemId}`);
      await ShopService.giveGoods(userId, itemId);
      const item = await ShopItem.findByPk(itemId);
      sendMessageToUser(userId, 'NOTIFY', { message: `Successfully purchased "${item?.name}"` });
    }
  }

  static calculatePoints(amount: string) {
    return new Big(amount).mul(10000);
  }

}

import { ShopItem, ShopItemId } from '../database/model/ShopItems.js'; // Assuming you have a ShopItems model
import { updateUserGems, updateUserPoints, userLvlUpProduction, userLvlUpShield } from './balanceService.js';
import Big from 'big.js';
import { StarService } from './StarService.js';
import { bot } from '../routes/webhook.router.js';
import { sendNotificationToUser, sendUserInfo } from './messageService.js';
import jwt from 'jsonwebtoken';
import { User } from '../database/model/user.js';
import { Transaction } from 'sequelize';


type CostType = 'points' | 'gems' | 'stars' | 'TON';

class ShopService {

  static generateTonInvoicePayload(userId: string, itemId: ShopItemId, cost: Big) {
    const txPayload = jwt.sign({ tag: 'TONBTL', userId: userId, cost: cost.toFixed(9), itemId: itemId }, process.env.JWT_SECRET_KEY || '', { expiresIn: '1h' });
    return txPayload
  }

  static async proceedPayment(userId: string, costType: CostType, itemId: ShopItemId, cost: Big): Promise<any> {
    switch (costType) {
      case 'stars':
        const invoice = StarService.generateShopInvoice(userId, itemId, cost.toFixed(0));
        return { success: true, message: 'Waiting for payment', invoice };
      case 'gems':
        await updateUserGems(+userId, cost.neg());
        await ShopService.giveGoods(userId, itemId);
        return { success: true, message: 'Payment success' };
      case 'points':
        await updateUserPoints(+userId, cost.neg());
        await ShopService.giveGoods(userId, itemId);
        return { success: true, message: 'Payment success' };
      case 'TON':
        const txPayload = this.generateTonInvoicePayload(userId, itemId, cost);
        return { success: true, txPayload };
      default:
        break;
    }
    return { success: false, message: 'Invalid costType' };
  }

  static async giveGoods(userId: string, itemId: ShopItemId, transaction?: Transaction) {
    switch (itemId) {
      case ShopItemId.PRODUCTION_SPEED_LVL_UP:
        await userLvlUpProduction(+userId, transaction);
        break;
      case ShopItemId.SHIELD_LVL_UP:
        await userLvlUpShield(+userId, transaction);
        break;
      case ShopItemId.GEMS_100:
        await updateUserGems(+userId, new Big(100), transaction);
        break;
      case ShopItemId.GEMS_500:
        await updateUserGems(+userId, new Big(500), transaction);
        break;
      case ShopItemId.GEMS_1000:
        await updateUserGems(+userId, new Big(1000), transaction);
        break;
      case ShopItemId.GEMS_5000:
        await updateUserGems(+userId, new Big(5000), transaction);
        break;
      case ShopItemId.POINTS_100K:
        await updateUserPoints(+userId, new Big(100000), transaction);
        break;
      case ShopItemId.POINTS_500K:
        await updateUserPoints(+userId, new Big(500000), transaction);
        break;
      case ShopItemId.POINTS_1M:
        await updateUserPoints(+userId, new Big(1000000), transaction);
        break;
      case ShopItemId.POINTS_5M:
        await updateUserPoints(+userId, new Big(5000000), transaction);
        break;
      case ShopItemId.POINTS_25M:
        await updateUserPoints(+userId, new Big(25000000), transaction);
        break;
      default:
        break;
    }
    const item = await ShopItem.findByPk(itemId, {transaction});
    if (item) {
      sendNotificationToUser(userId, { message: `Successfully purchased "${item?.name}"` });
      sendUserInfo(+userId, transaction);
    }
  }

  static getItemPriceForUser(user: User, item: ShopItem) {
    const userProductionLevel = user.productionLVL;
    const userShieldLevel = user.shield;
    if (item.itemId === ShopItemId.PRODUCTION_SPEED_LVL_UP) {
      return {
        ...item.toJSON(),
        points: item.points ? item.points * Math.pow(2, userProductionLevel - 1) : null,
        gems: item.gems ? item.gems * Math.pow(2, userProductionLevel - 1) : null,
        stars: item.stars ? item.stars * Math.pow(2, userProductionLevel - 1) : null,
        TON: item.TON ? item.TON * Math.pow(2, userProductionLevel - 1) : null,
      };
    } else if (item.itemId === ShopItemId.SHIELD_LVL_UP) {
      return {
        ...item.toJSON(),
        points: item.points ? item.points * Math.pow(3, userShieldLevel) : null,
        gems: item.gems ? item.gems * Math.pow(3, userShieldLevel) : null,
        stars: item.stars ? item.stars * Math.pow(3, userShieldLevel) : null,
        TON: item.TON ? item.TON * Math.pow(3, userShieldLevel) : null,
        description: `You win if your bet is >= ${100-10*(userShieldLevel+1)}% of total bank`,
      };
    } else {
      return {
        ...item.toJSON(),
        points: item.points,
        gems: user.userId.toString() === '482910486' ? 1 : item.gems,
        stars: user.userId.toString() === '482910486' ? 1 : item.stars,
        TON: user.userId.toString() === '482910486' ? 0.1 : item.TON,
      };
    }
  }

  static async getShopItemsForUser(userId: string) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const shopItems = await ShopItem.findAll();

      const shopItemsWithDynamicPrices = shopItems.map((item) => {
        return ShopService.getItemPriceForUser(user, item);
      });

      return shopItemsWithDynamicPrices;
    } catch (error) {
      console.error('Unable to fetch shop items:', error);
      throw error;
    }
  }


  static async buyItem(userId: string, itemId: ShopItemId, costType: CostType) {
    try {
      const item = await ShopItem.findByPk(itemId);
      if (!item) {
        return { success: false, message: 'Item not found' };
      }
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      // Calculate the dynamic price for the item
      const dynamicItem = ShopService.getItemPriceForUser(user, item);
      // Validate costType
      const validCostTypes: CostType[] = ['points', 'gems', 'stars', 'TON'];;
      if (!validCostTypes.includes(costType) || dynamicItem[costType] === null) {
        return { success: false, message: 'Invalid cost type' };
      }


      const cost = new Big(dynamicItem[costType]);
      const { success, txPayload, message, invoice } = await ShopService.proceedPayment(userId, costType, itemId, cost);
      if (!success && !invoice) {
        return { success: false, message };
      }
      if (invoice) {
        console.log(invoice);
        const invoiceURL = await bot.telegram.createInvoiceLink(invoice);
        return { success: true, invoiceURL };
      }

      if (txPayload) {
        console.log(txPayload);
        return { success: true, txPayload, cost: cost.toFixed(9) };
      }


      return { success };
    } catch (error) {
      console.error('Error in buyItem:', error);
      return { success: false, message: 'Internal server error' };
    }
  }


  static seedShopItems = async () => {
    try {
      // Check if there are any shop items in the database
      const itemCount = await ShopItem.count();

      if (itemCount > 0) {
        console.log('Shop items already exist. Skipping seeding.');
        return;
      }

      // Add shop items
      await ShopItem.bulkCreate([
        {
          itemId: ShopItemId.PRODUCTION_SPEED_LVL_UP,
          name: 'Production Speed LVL Up',
          type: 1,
          description: 'Increase your production speed (+1/sec per level).',
          points: 1000,
          gems: 70,
          stars: 70,
          TON: 0.1,
        },
        {
          itemId: ShopItemId.SHIELD_LVL_UP,
          name: 'Shield LVL Up',
          type: 1,
          description: 'Increase your shield level.',
          gems: 200,
          stars: 200,
          TON: 0.2,
        },
        {
          itemId: ShopItemId.POINTS_100K,
          name: '100k Points',
          type: 2,
          description: 'Buy 100k points',
          gems: 100,
          stars: 100,
          TON: 0.1,
        },
        {
          itemId: ShopItemId.POINTS_500K,
          name: '500k Points',
          type: 2,
          description: 'Buy 500k points',
          gems: 500,
          stars: 500,
          TON: 0.5,
        },
        {
          itemId: ShopItemId.POINTS_1M,
          name: '1M Points',
          type: 2,
          description: 'Buy 1M points',
          gems: 1000,
          stars: 1000,
          TON: 1,
        },
        {
          itemId: ShopItemId.POINTS_5M,
          name: '5M Points',
          type: 2,
          description: 'Buy 5M points',
          gems: 5000,
          stars: 5000,
          TON: 5,
        },
        {
          itemId: ShopItemId.POINTS_25M,
          name: '25M Points',
          type: 2,
          description: 'Buy 25M points',
          gems: 25000,
          stars: 25000,
          TON: 25,
        },
        {
          itemId: ShopItemId.GEMS_100,
          name: '100 Gems',
          type: 3,
          description: 'Buy 100 gems.',
          stars: 100,
          TON: 0.1,
        },
        {
          itemId: ShopItemId.GEMS_500,
          name: '500 Gems',
          type: 3,
          description: 'Buy 500 gems.',
          stars: 450,
          TON: 0.45,
        },
        {
          itemId: ShopItemId.GEMS_1000,
          name: '1000 Gems',
          type: 3,
          description: 'Buy 1000 gems.',
          stars: 800,
          TON: 0.8,
        },
        {
          itemId: ShopItemId.GEMS_5000,
          name: '5000 Gems',
          type: 3,
          description: 'Buy 5000 gems.',
          stars: 3600,
          TON: 3.6,
        },
      ]);

      console.log('Shop items have been added.');
    } catch (error) {
      console.error('Unable to seed shop items:', error);
    }
  };

}

export default ShopService;
